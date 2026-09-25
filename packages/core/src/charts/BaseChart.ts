/**
 * Base chart class that all chart types extend
 */

import type {
  BaseChartConfig,
  Chart,
  Dimensions,
  DataPoint,
  SeriesData,
  FlexibleDataInput,
  ChartPlugin,
  PluginContext,
} from '../types';
import {
  getDefaultDimensions,
  getThemeColors,
  normalizeToSeriesData,
  createLinearScale,
  createBandScale,
} from '../utils';
import { downsampleEveryNth, downsampleLTTB } from '../utils/sampling';
import {
  generateAriaLabel,
  generateDefaultTitle,
  generateDescription,
  generateDataTableHTML,
} from '../a11y/descriptions';
import { injectAccessibilityStyles } from '../a11y/styles';
import { KeyboardNavigator } from '../a11y/keyboard';
import {
  CHART_DEFAULTS,
  CHART_POINT_BUDGET,
  createGroup,
  createSVGElement,
} from '../render/constants';
import { renderTitle as drawTitle } from '../render/title';
import {
  renderLegend as drawLegend,
  legendOptions,
  legendRows,
  type LegendItem,
} from '../render/legend';
import { renderOverlays, type ChartBounds } from '../render/overlays';
import {
  linearAxis,
  labelWidth,
  drawLinearX,
  drawLinearY,
  drawCategoryX,
  drawCategoryY,
  drawBaseline,
} from '../render/axes';

type ChartPluginHook = Exclude<keyof ChartPlugin, 'name'>;

const isSelector = (value: HTMLElement | string): value is string =>
  typeof value === 'string';
const isStringValue = (value: any): value is string => typeof value === 'string';
const isBooleanValue = (value: any): value is boolean => typeof value === 'boolean';

function updateTable(
  foreignObject: SVGForeignObjectElement,
  title: string,
  data: DataPoint[],
  seriesData: SeriesData[]
): boolean {
  if (seriesData.length !== 1 || foreignObject.childNodes.length !== 1) return false;

  const table = foreignObject.querySelector<HTMLTableElement>('table.sr-only');
  if (
    !table ||
    table !== foreignObject.firstElementChild ||
    table.getAttribute('aria-label') !== 'Chart data table' ||
    table.children.length !== 3 ||
    table.tBodies.length !== 1 ||
    table.tHead?.rows.length !== 1
  ) return false;

  const header = table.tHead.rows[0];
  const body = table.tBodies[0];
  if (
    !table.caption ||
    header.innerHTML !== '<th scope="col">Category</th><th scope="col">Value</th>' ||
    body.rows.length !== data.length
  ) return false;

  table.caption.textContent = `${title} - Data Table`;
  for (let index = 0; index < body.rows.length; index += 1) {
    const cells = body.rows[index].cells;
    if (
      cells.length !== 2 ||
      cells[0].tagName !== 'TD' ||
      cells[1].tagName !== 'TD' ||
      cells[0].childNodes.length !== 1 ||
      cells[1].childNodes.length !== 1
    ) return false;

    const xNode = cells[0].firstChild;
    const yNode = cells[1].firstChild;
    if (xNode?.nodeName !== '#text' || yNode?.nodeName !== '#text') return false;
    const point = data[index];
    xNode.nodeValue = String(point.x);
    yNode.nodeValue = String(point.y);
  }
  return true;
}

/** A laid-out cartesian plot area, returned by {@link BaseChart.plot}. */
export interface Plot {
  /** Group for data marks (inside `g.chart-main`, above grid and axes). */
  g: SVGGElement;
  /** Plot width/height in px. */
  w: number;
  h: number;
  /** Pixel position on x: band start for categories, position for numbers. */
  x: (value: string | number) => number;
  /** Pixel position on y: band start for categories, position for numbers. */
  y: (value: string | number) => number;
  /** Band width of the categorical axis (0 when both axes are linear). */
  bw: number;
}

/** A categorical axis (its labels) or a linear axis (its data extent). */
type AxisDomain = string[] | [number, number];

const isCategories = (domain: AxisDomain): domain is string[] => typeof domain[0] === 'string';

export abstract class BaseChart implements Chart {
  protected container: HTMLElement;
  protected config: BaseChartConfig;
  protected svg: SVGSVGElement | null = null;
  protected dimensions: Dimensions;
  protected data!: DataPoint[]; // Legacy: for single-series backward compatibility
  protected seriesData!: SeriesData[]; // New: normalized multi-series data
  protected isMultiSeries!: boolean;
  // Resolved (unwrapped) per-series colors, kept so the CSS-variable root tokens
  // can be emitted even when `seriesData[i].color` is a `var(--cl-series-i, …)` string.
  protected resolvedSeriesColors: string[] = [];
  private tableFallback: SVGForeignObjectElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private layoutWidth: number;
  private layoutHeight: number;
  protected chartTypeName: string;
  protected eventListeners: Array<{
    element: Element;
    event: string;
    handler: EventListener;
  }> = [];

  // Plugin system
  protected plugins: ChartPlugin[] = [];
  private eventHandlers: Map<string, Set<(data?: any) => void>> = new Map();

  // Chart bounds for overlay features (set by subclasses)
  protected chartBounds: ChartBounds | null = null;

  constructor(
    container: HTMLElement | string,
    config: BaseChartConfig,
    dataInput: FlexibleDataInput,
    chartTypeName: string
  ) {
    this.chartTypeName = chartTypeName;
    // Validate and set container
    if (isSelector(container)) {
      const element = document.querySelector<HTMLElement>(container);
      if (!element) {
        throw new Error(`Container not found: ${container}`);
      }
      this.container = element;
    } else {
      if (!container || !(container instanceof HTMLElement)) {
        throw new Error('Container must be a valid HTMLElement');
      }
      this.container = container;
    }

    // Validate config
    this.validateConfig(config);

    // Base defaults sit below the config, which subclasses have already merged
    // with their own chart-type defaults, so `responsive` survives everywhere.
    this.config = {
      theme: 'default',
      responsive: true,
      // Performance defaults (animations off for speed)
      animate: false,
      ...config,
    };

    this.setData(dataInput);

    // Size to the container unless explicit. A container without a usable
    // height (auto-height, or collapsed by flex/grid) falls back to the default.
    const { clientWidth, clientHeight } = this.container;
    this.layoutWidth = this.config.width ?? (clientWidth || CHART_DEFAULTS.DEFAULT_WIDTH);
    this.layoutHeight = this.config.height ?? (clientHeight > 50 ? clientHeight : CHART_DEFAULTS.DEFAULT_HEIGHT);
    this.dimensions = this.calculateDimensions(this.layoutWidth, this.layoutHeight);

    // Initialize plugins
    this.plugins = this.config.plugins || [];
  }

  /**
   * Validate chart configuration
   */
  private validateConfig(config: BaseChartConfig): void {
    // Validate dimensions if provided
    if (config.width !== undefined && (config.width <= 0 || !isFinite(config.width))) {
      throw new Error(`Invalid width: ${config.width}`);
    }
    if (config.height !== undefined && (config.height <= 0 || !isFinite(config.height))) {
      throw new Error(`Invalid height: ${config.height}`);
    }

    // Validate theme
    if (
      config.theme &&
      config.theme !== 'default' &&
      getThemeColors(config.theme) === getThemeColors('default')
    ) {
      throw new Error(`Invalid theme: ${config.theme}`);
    }

    // Validate colors array if provided
    if (config.colors) {
      if (!Array.isArray(config.colors)) {
        throw new Error('Colors must be an array');
      }
      if (config.colors.length === 0) {
        throw new Error('Colors array cannot be empty');
      }
      // Basic color format validation (hex, rgb, named colors)
      config.colors.forEach((color, index) => {
        if (!isStringValue(color)) {
          throw new Error(`Invalid color at index ${index}: ${color}`);
        }

        // Allow hex, CSS named colors, and any CSS color function
        // (rgb, hsl, oklch, color-mix, var(--brand), ...).
        if (!/^(?:#[\da-f]{3,8}|[a-z]{3,20}|[a-z-]+\(.+\))$/i.test(color.trim())) {
          throw new Error(`Invalid color at index ${index}: ${color}`);
        }
      });
    }

    // Validate boolean flags
    if (config.animate !== undefined && !isBooleanValue(config.animate)) {
      throw new Error('animate must be boolean');
    }
    if (config.responsive !== undefined && !isBooleanValue(config.responsive)) {
      throw new Error('responsive must be boolean');
    }
    if (config.maxPoints !== undefined && !(config.maxPoints >= 0)) {
      throw new Error('maxPoints must be a non-negative number (0 disables sampling)');
    }
    // Validate legend config if provided
    if (config.legend && !isBooleanValue(config.legend)) {
      if (config.legend.show !== undefined && !isBooleanValue(config.legend.show)) {
        throw new Error('legend.show must be boolean');
      }
      if (config.legend.position && !['top', 'bottom'].includes(config.legend.position)) {
        throw new Error(`Invalid legend.position: ${config.legend.position}`);
      }
      if (config.legend.align && !['left', 'center', 'right'].includes(config.legend.align)) {
        throw new Error(`Invalid legend.align: ${config.legend.align}`);
      }
      if (config.legend.layout && !['horizontal', 'vertical'].includes(config.legend.layout)) {
        throw new Error(`Invalid legend.layout: ${config.legend.layout}`);
      }
    }
  }

  /**
   * Calculate dimensions. The SVG is exactly `width` × `height`; the title and
   * legend take their space from the margins, never by growing the chart.
   */
  protected calculateDimensions(width: number, height: number): Dimensions {
    const { PADDING, TITLE_HEIGHT, LEGEND_ROW_HEIGHT } = CHART_DEFAULTS;
    const margin = this.hasAxes()
      ? getDefaultDimensions(width, height).margin
      : { top: PADDING, right: PADDING, bottom: PADDING, left: PADDING };

    if (this.config.title) margin.top += TITLE_HEIGHT;

    const rows = this.legendLayout(width).length;
    if (rows) {
      const legendHeight = rows * LEGEND_ROW_HEIGHT + 8;
      if (legendOptions(this.config).position === 'bottom') margin.bottom += legendHeight;
      else margin.top += legendHeight;
    }

    return { width, height, margin };
  }

  /**
   * Whether the chart draws cartesian axes (and so reserves axis margins). A
   * method rather than a field so it is correct while the base constructor runs.
   */
  protected hasAxes(): boolean {
    return true;
  }

  /** Colors for per-point marks (pie slices, radial rings): `colors`, else the theme palette. */
  protected palette(): string[] {
    return this.config.colors?.length ? this.config.colors : this.themeColors().seriesColors;
  }

  /** Items shown in the legend: one per series, or per point (slice/ring) on pie and radial charts. */
  protected legendItems(): LegendItem[] {
    if (this.hasAxes()) return this.seriesData.map((series) => ({ name: series.name, color: series.color! }));
    const palette = this.palette();
    return this.data.map((d, i) => ({ name: String(d.label ?? d.x), color: palette[i % palette.length] }));
  }

  /** Legend rows for the given width, or none when the legend is hidden. */
  private legendLayout(width: number): number[][] {
    const { legend } = this.config;
    const options = legendOptions(this.config);
    const items = this.legendItems();
    // A legend needs at least two entries to tell apart (as in 1.0).
    if (legend === false || options.show === false || items.length < 2) return [];
    return legendRows(items, width - 2 * CHART_DEFAULTS.PADDING, options.layout === 'vertical');
  }

  /**
   * Plugin system methods
   */

  /**
   * Create plugin context for current state
   */
  protected createPluginContext(): PluginContext {
    const context: PluginContext = {
      chart: this,
      svg: this.svg,
      config: this.config,
      data: this.isMultiSeries ? this.seriesData : this.data,
      dimensions: this.dimensions,
      container: this.container,
      createSVGElement: <K extends keyof SVGElementTagNameMap>(
        tagName: K,
        attributes?: Record<string, string | number>
      ): SVGElementTagNameMap[K] => {
        const element = createSVGElement(tagName);
        if (attributes) {
          Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, String(value));
          });
        }
        return element;
      },
      emit: this.emit.bind(this),
      on: this.on.bind(this),
      off: this.off.bind(this),
    };
    return context;
  }

  /**
   * Call a lifecycle hook on all plugins
   */
  protected callPluginHook(hookName: ChartPluginHook): void {
    const context = this.createPluginContext();
    this.plugins.forEach((plugin) => {
      const hook = plugin[hookName];
      if (hook) {
        try {
          hook.call(plugin, context);
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}" ${hookName} hook:`, error);
        }
      }
    });
  }

  /**
   * Event system for plugins
   */
  protected emit(eventName: string, data?: any): void {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${eventName}":`, error);
        }
      });
    }
  }

  protected on(eventName: string, handler: (data?: any) => void): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName)!.add(handler);
  }

  protected off(eventName: string, handler: (data?: any) => void): void {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /** True when colors should be emitted as `var(--cl-*, fallback)` for CSS theming. */
  protected get useCssVars(): boolean {
    return this.config.cssVars === true;
  }

  /** Normalize, validate, color, and cap input data for rendering. */
  private setData(dataInput: FlexibleDataInput): void {
    this.seriesData = normalizeToSeriesData(dataInput);
    if (!this.seriesData.length || !this.seriesData[0]?.data.length) {
      throw new Error('Chart data cannot be empty');
    }
    this.isMultiSeries = this.seriesData.length > 1;
    this.assignSeriesColors();
    // Chart-wide point budget. A single series uses LTTB, which keeps peaks and
    // dips; multiple series sample every nth point so their x values stay aligned.
    const budget = this.config.maxPoints ?? CHART_POINT_BUDGET;
    const pointLimit = Math.max(3, Math.floor(budget / this.seriesData.length));
    const sample = this.isMultiSeries ? downsampleEveryNth : downsampleLTTB;
    this.seriesData = this.seriesData.map(series => budget && series.data.length > pointLimit
      ? { ...series, data: sample(series.data, pointLimit) }
      : series
    );
    this.data = this.seriesData[0].data;
  }

  /**
   * Resolve each series' color (explicit per-series > `colors` config > theme
   * palette), record the resolved values in `resolvedSeriesColors`, and store the
   * applied color on each series — wrapped as `var(--cl-series-i, resolved)` when
   * `cssVars` is enabled so it can be overridden with plain CSS.
   */
  private assignSeriesColors(): void {
    const theme = getThemeColors(this.config.theme || 'default');
    const palette = this.config.colors?.length ? this.config.colors : theme.seriesColors;

    this.resolvedSeriesColors = this.seriesData.map(
      (series, index) => series.color || palette[index % palette.length]
    );

    this.seriesData = this.seriesData.map((series, index) => ({
      ...series,
      color: this.useCssVars
        ? `var(--cl-series-${index}, ${this.resolvedSeriesColors[index]})`
        : this.resolvedSeriesColors[index],
    }));
  }

  /**
   * Theme colors for the current config. When `cssVars` is on, every field is
   * wrapped as `var(--cl-*, fallback)` so the whole chart is re-themeable with
   * CSS, including the background-coloured label halos and marker outlines.
   */
  protected themeColors(): ReturnType<typeof getThemeColors> {
    const colors = getThemeColors(this.config.theme || 'default');
    if (!this.useCssVars) return colors;
    return {
      background: `var(--cl-bg, ${colors.background})`,
      foreground: `var(--cl-fg, ${colors.foreground})`,
      primary: `var(--cl-primary, ${colors.primary})`,
      grid: `var(--cl-grid, ${colors.grid})`,
      text: `var(--cl-text, ${colors.text})`,
      seriesColors: colors.seriesColors.map(
        (color, i) => `var(--cl-series-${i}, ${color})`
      ),
    };
  }

  /**
   * Create the SVG element with accessibility attributes
   */
  protected createSVG(): SVGSVGElement {
    const svg = createSVGElement('svg');
    this.prepareSVG(svg);
    return svg;
  }

  /** Refresh root attributes and accessibility content on every render/update. */
  private prepareSVG(svg: SVGSVGElement): void {
    svg.setAttribute('width', String(this.dimensions.width));
    svg.setAttribute('height', String(this.dimensions.height));
    svg.setAttribute('viewBox', `0 0 ${this.dimensions.width} ${this.dimensions.height}`);
    // Standalone-valid SVG (files, <img>, data URIs), fluid when its container
    // is narrower, and block-level so there is no inline descender gap (which
    // also kept auto-height containers growing on every resize).
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Apply theme background. In cssVars mode, reference the background through
    // `var(--cl-bg, …)` and — crucially — do NOT set `--cl-bg` (or any `--cl-*`)
    // on the SVG itself. The colors are already emitted as `var(--cl-*, fallback)`,
    // so the fallback is the default and an ancestor (`:root`, a wrapper, a global
    // theme toggle) can override every token via the normal CSS cascade. Setting
    // the tokens on the SVG here would win over ancestors and make theming inert.
    const { background } = getThemeColors(this.config.theme || 'default');
    Object.assign(svg.style, {
      display: 'block',
      maxWidth: '100%',
      height: 'auto',
      fontFamily: 'system-ui,sans-serif',
      fontVariantNumeric: 'tabular-nums',
      backgroundColor: this.useCssVars ? `var(--cl-bg, ${background})` : background,
    } satisfies Partial<CSSStyleDeclaration>);

    // ARIA role and label for accessibility
    svg.setAttribute('role', 'img');
    svg.setAttribute(
      'aria-label',
      generateAriaLabel({
        chartTypeName: this.chartTypeName,
        title: this.config.title,
        data: this.data,
        seriesData: this.seriesData,
      })
    );

    // Make SVG focusable for keyboard navigation
    svg.setAttribute('tabindex', '0');

    // Title and description for screen readers
    const title = createSVGElement('title');
    title.textContent = this.config.title || generateDefaultTitle(this.chartTypeName);
    svg.appendChild(title);

    const desc = createSVGElement('desc');
    desc.textContent = generateDescription({
      chartTypeName: this.chartTypeName,
      data: this.data,
      seriesData: this.seriesData,
    });
    svg.appendChild(desc);

    // Add data table fallback for screen readers
    this.addDataTableFallback(svg);

    // Setup keyboard navigation
    this.setupKeyboardNavigation(svg);

    // Inject accessibility styles if not already present
    injectAccessibilityStyles();
  }

  /**
   * Add data table fallback for screen readers
   */
  private addDataTableFallback(svg: SVGSVGElement): void {
    const title = this.config.title || generateDefaultTitle(this.chartTypeName);
    const retainedFallback = this.tableFallback;
    if (retainedFallback && updateTable(retainedFallback, title, this.data, this.seriesData)) {
      svg.appendChild(retainedFallback);
      return;
    }

    const foreignObject = createSVGElement('foreignObject');
    foreignObject.setAttribute('width', '0');
    foreignObject.setAttribute('height', '0');
    foreignObject.setAttribute('overflow', 'hidden');

    foreignObject.innerHTML = generateDataTableHTML({
      title,
      data: this.data,
      seriesData: this.seriesData,
    });

    this.tableFallback = foreignObject;
    svg.appendChild(foreignObject);
  }

  /**
   * Setup keyboard navigation for the chart. The focus state machine lives in
   * KeyboardNavigator; listeners are registered through the tracked mechanism so
   * destroy() tears them down with everything else.
   */
  private setupKeyboardNavigation(svg: SVGSVGElement): void {
    new KeyboardNavigator({
      svg,
      emit: (eventName, data) => this.emit(eventName, data),
      addListener: (element, event, handler) =>
        this.addEventListenerTracked(element, event, handler),
    });
  }

  /**
   * Create a group element with transform
   */
  protected createGroup(x: number = 0, y: number = 0): SVGGElement {
    return createGroup(x, y);
  }

  public render(): this {
    // Call beforeRender plugin hook
    this.callPluginHook('beforeRender');

    // Clear existing content and event listeners while preserving the SVG root.
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    if (this.svg) {
      // Reuse the SVG root, but rebuild its content and accessibility metadata.
      const retainedFallback = this.tableFallback;
      if (retainedFallback?.parentNode) {
        retainedFallback.parentNode.removeChild(retainedFallback);
      }
      this.svg.replaceChildren();
      this.prepareSVG(this.svg);
    } else {
      // First render: create SVG
      this.svg = this.createSVG();
      this.container.innerHTML = '';
      this.container.appendChild(this.svg);
    }

    // Render chart-specific content FIRST
    // This must happen before title/legend so we know the data bounds
    this.renderChart();

    // Regions, reference lines and annotations (cartesian charts only).
    if (this.chartBounds) {
      renderOverlays(this.svg, this.config, this.dimensions, this.chartBounds, this.themeColors());
    }

    // Title and legend sit in the top/bottom margins, outside the data area.
    if (this.config.title) {
      drawTitle(this.svg!, this.config, this.themeColors());
    }
    if (this.legendLayout(this.dimensions.width).length) {
      drawLegend(
        this.svg!,
        this.config,
        this.dimensions,
        this.legendItems(),
        this.themeColors(),
        CHART_DEFAULTS.PADDING + (this.config.title ? CHART_DEFAULTS.TITLE_HEIGHT : 0)
      );
    }

    // Apply animation if enabled
    if (this.config.animate) {
      this.applyAnimation();
    }

    // Append to container if not already there
    if (this.svg && !this.svg.parentNode) {
      this.container.appendChild(this.svg);
    }

    // Set up resize observer if responsive
    if (this.config.responsive && !this.resizeObserver && 'ResizeObserver' in globalThis) {
      this.setupResizeObserver();
    }

    // Call afterRender plugin hook
    this.callPluginHook('afterRender');
    return this;
  }

  /**
   * Set up resize observer for responsive charts with throttling
   */
  private setupResizeObserver(): void {
    this.resizeObserver = new globalThis.ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;

      // Only resize if dimensions have actually changed and are valid
      if (width > 0 && height > 0) {
        const newWidth = this.config.width ?? Math.round(width);
        // The SVG is block-level and exactly layoutHeight tall, so an
        // auto-height container reports our own height back; ignore sub-pixel
        // differences so that can never feed a resize loop.
        const newHeight = this.config.height ??
          (Math.abs(height - this.layoutHeight) < 2 || height <= 50 ? this.layoutHeight : Math.round(height));

        // Update dimensions if changed - but throttle to avoid excessive re-renders
        if (newWidth !== this.layoutWidth || newHeight !== this.layoutHeight) {
          // Clear any pending resize
          if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
          }

          // Debounce the resize operation
          this.resizeTimeout = setTimeout(() => {
            this.layoutWidth = newWidth;
            this.layoutHeight = newHeight;
            this.dimensions = this.calculateDimensions(this.layoutWidth, this.layoutHeight);
            // Re-render without animation to avoid janky resizing
            const originalAnimate = this.config.animate;
            this.config.animate = false;
            try {
              this.render();
              // Call onResize plugin hook
              this.callPluginHook('onResize');
            } finally {
              this.config.animate = originalAnimate;
              this.resizeTimeout = null;
            }
          }, CHART_DEFAULTS.RESIZE_DEBOUNCE_MS);
        }
      }
    });

    this.resizeObserver.observe(this.container);
  }

  /**
   * Apply entrance animation
   */
  protected applyAnimation(): void {
    if (!this.svg) return;

    const style = createSVGElement('style');
    // Gate the entrance animation behind `prefers-reduced-motion: no-preference`
    // so users who ask their OS to reduce motion never see it (WCAG 2.3.3).
    style.textContent = '@keyframes clFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion: no-preference){.chart-animated{animation:clFade .6s ease-out}}';
    this.svg.appendChild(style);

    // Animate the data marks only; axes and gridlines stay put.
    const marks = this.svg.querySelector('g.chart-marks') ?? this.svg.querySelector('g.chart-main');
    marks?.classList.add('chart-animated');
  }

  /**
   * Update the chart's data and, optionally, any other options (theme, title,
   * colors, ...), then re-render in place.
   */
  public update(data: DataPoint[] | FlexibleDataInput, options?: Partial<BaseChartConfig>): this {
    // Call beforeUpdate plugin hook
    this.callPluginHook('beforeUpdate');

    if (options) {
      this.validateConfig(options);
      Object.assign(this.config, options);
      this.layoutWidth = options.width ?? this.layoutWidth;
      this.layoutHeight = options.height ?? this.layoutHeight;
    }
    this.setData(data);

    // Series count can change the amount of space reserved for the legend.
    this.dimensions = this.calculateDimensions(this.layoutWidth, this.layoutHeight);

    this.render();

    // Call afterUpdate plugin hook
    this.callPluginHook('afterUpdate');
    return this;
  }

  /**
   * Add event listener and track it for cleanup
   */
  protected addEventListenerTracked(
    element: Element,
    event: string,
    handler: EventListener
  ): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Destroy the chart and cleanup all resources
   */
  public destroy(): void {
    // Call beforeDestroy plugin hook
    this.callPluginHook('beforeDestroy');

    // Remove all tracked event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Clear any pending resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Remove SVG
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.svg = null;
    this.tableFallback = null;

    // Clear event handlers
    this.eventHandlers.clear();

  }

  /**
   * Export as SVG string
   * Note: Chart must be rendered before calling this method
   */
  public toSVG(): string {
    if (!this.svg) {
      throw new Error('Chart must be rendered before calling toSVG()');
    }
    return this.svg.outerHTML;
  }

  /**
   * Lay out and draw a cartesian plot: nice the linear axes, fit the left
   * margin to the y labels, draw grid, baseline and tick labels into a new
   * `g.chart-main`, record the chart bounds for overlays, and return the scales.
   * `zero` keeps the value axis anchored at zero; `padding` is the band padding.
   */
  protected plot(xDomain: AxisDomain, yDomain: AxisDomain, zero = false, padding = 0): Plot {
    const { PADDING, AXIS_LABEL_OFFSET } = CHART_DEFAULTS;
    const svg = this.svg;
    if (!svg) throw new Error('plot() requires a rendered SVG');
    const colors = this.themeColors();
    const { width, height, margin } = this.dimensions;
    const h = Math.max(0, height - margin.top - margin.bottom);
    const { valueFormatter, xFormatter } = this.config;

    // The y axis decides the left margin, which decides the plot width.
    const yAxis = isCategories(yDomain) ? undefined : linearAxis(yDomain[0], yDomain[1], h, 60, zero, valueFormatter);
    const yLabelWidth = isCategories(yDomain)
      ? Math.min(labelWidth(yDomain), width * 0.3)
      : labelWidth(yAxis ? yAxis.ticks.map(yAxis.format) : []);
    margin.left = PADDING + yLabelWidth + AXIS_LABEL_OFFSET;
    const w = Math.max(0, width - margin.left - margin.right);
    // Horizontal (categorical y) charts put the values on x.
    const xAxis = isCategories(xDomain)
      ? undefined
      : isCategories(yDomain)
        ? linearAxis(xDomain[0], xDomain[1], w, 90, zero, valueFormatter)
        : linearAxis(xDomain[0], xDomain[1], w, 90, false, xFormatter);

    const main = createGroup(margin.left, margin.top);
    main.classList.add('chart-main');
    svg.appendChild(main);

    const band = (domain: string[], extent: number) => {
      const scale = createBandScale(domain, [0, extent], padding);
      return { at: (v: string | number) => scale.scale(String(v)), bw: scale.bandwidth };
    };
    const xBand = isCategories(xDomain) ? band(xDomain, w) : undefined;
    const yBand = isCategories(yDomain) ? band(yDomain, h) : undefined;
    const xLinear = xAxis ? createLinearScale([xAxis.min, xAxis.max], [0, w]) : undefined;
    const yLinear = yAxis ? createLinearScale([yAxis.min, yAxis.max], [h, 0]) : undefined;

    if (yAxis && yLinear) drawLinearY(main, yAxis, yLinear, w, colors);
    if (xAxis && xLinear) drawLinearX(main, xAxis, xLinear, h, colors);
    if (xBand && isCategories(xDomain)) {
      const labels = xFormatter ? xDomain.map(xFormatter) : xDomain;
      drawCategoryX(main, labels, (i) => xBand.at(xDomain[i]) + xBand.bw / 2, w, h, colors);
      drawBaseline(main, `M0,${Math.round(h) + 0.5}H${Math.round(w)}`, colors);
    }
    if (yBand && isCategories(yDomain)) {
      drawCategoryY(main, yDomain, (i) => yBand.at(yDomain[i]) + yBand.bw / 2, h, yLabelWidth, colors);
      drawBaseline(main, `M${Math.round(xLinear ? xLinear(0) : 0) + 0.5},0V${Math.round(h)}`, colors);
    }

    this.chartBounds = {
      xMin: xAxis ? xAxis.min : 0,
      xMax: xAxis ? xAxis.max : xDomain.length - 1,
      yMin: yAxis ? yAxis.min : 0,
      yMax: yAxis ? yAxis.max : yDomain.length - 1,
      xValues: isCategories(xDomain) ? xDomain : undefined,
    };

    const g = createGroup();
    g.classList.add('chart-marks');
    main.appendChild(g);
    return {
      g,
      w,
      h,
      x: xBand ? xBand.at : (v) => (xLinear ? xLinear(Number(v)) : 0),
      y: yBand ? yBand.at : (v) => (yLinear ? yLinear(Number(v)) : 0),
      bw: (xBand || yBand)?.bw ?? 0,
    };
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract renderChart(): void;
}
