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
  isMultiSeriesData,
  normalizeToSeriesData,
  generateSeriesColors,
  autoDownsample,
  ElementPool,
} from '../utils';
import {
  generateAriaLabel,
  generateDefaultTitle,
  generateDescription,
  generateDataTableHTML,
} from '../a11y/descriptions';
import { injectAccessibilityStyles } from '../a11y/styles';
import { KeyboardNavigator } from '../a11y/keyboard';
import { CHART_DEFAULTS } from '../render/constants';
import { renderTitle as drawTitle } from '../render/title';
import { renderLegend as drawLegend } from '../render/legend';
import {
  renderReferenceLines as drawReferenceLines,
  renderAnnotations as drawAnnotations,
  renderRegions as drawRegions,
  type ChartBounds,
} from '../render/overlays';
import {
  renderCategoricalXLinearYAxes as drawCategoricalXLinearYAxes,
  renderLinearXLinearYAxes as drawLinearXLinearYAxes,
  renderLinearXCategoricalYAxes as drawLinearXCategoricalYAxes,
} from '../render/axes';

export abstract class BaseChart implements Chart {
  protected container: HTMLElement;
  protected config: BaseChartConfig;
  protected svg: SVGSVGElement | null = null;
  protected dimensions: Dimensions;
  protected data: DataPoint[]; // Legacy: for single-series backward compatibility
  protected seriesData: SeriesData[]; // New: normalized multi-series data
  protected isMultiSeries: boolean;
  // Resolved (unwrapped) per-series colors, kept so the CSS-variable root tokens
  // can be emitted even when `seriesData[i].color` is a `var(--cl-series-i, …)` string.
  protected resolvedSeriesColors: string[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  protected eventListeners: Array<{
    element: Element;
    event: string;
    handler: EventListener;
  }> = [];

  // Plugin system
  protected plugins: ChartPlugin[] = [];
  private eventHandlers: Map<string, Set<(data?: any) => void>> = new Map();

  // Performance optimizations
  protected elementPool: ElementPool | null = null;

  // Chart bounds for overlay features (set by subclasses)
  protected chartBounds: ChartBounds | null = null;

  // Keyboard navigation (Phase 3)
  private keyboardNav: KeyboardNavigator | null = null;

  constructor(
    container: HTMLElement | string,
    config: BaseChartConfig,
    dataInput: FlexibleDataInput
  ) {
    // Validate and set container
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container not found: ${container}`);
      }
      this.container = element as HTMLElement;
    } else {
      if (!container || !(container instanceof HTMLElement)) {
        throw new Error('Container must be a valid HTMLElement or selector string');
      }
      this.container = container;
    }

    // Validate config
    this.validateConfig(config);

    // Set config with performance-optimized defaults
    this.config = {
      // Visual defaults
      theme: 'default',
      showLegend: false,
      responsive: true,
      // Performance defaults (animations off for speed)
      animate: false,
      ...config,
    };

    // Always initialize element pool for 42% faster updates
    this.elementPool = new ElementPool(2000);

    // Detect if multi-series data
    this.isMultiSeries = isMultiSeriesData(dataInput);

    // Normalize data to both formats for backward compatibility
    // This will throw if data is invalid (via our strengthened type guards)
    this.seriesData = normalizeToSeriesData(dataInput);
    this.data = this.seriesData[0]?.data || [];

    // Validate we have data
    if (this.seriesData.length === 0 || this.data.length === 0) {
      throw new Error('Chart data cannot be empty');
    }

    // Auto-assign colors to series (records resolved colors + var-wraps when cssVars)
    this.assignSeriesColors();

    // Automatic data sampling for performance (500+ points)
    // Uses fast 'nth' algorithm for best performance
    this.seriesData = this.seriesData.map(series => {
      if (series.data.length > 500) {
        return {
          ...series,
          data: autoDownsample(series.data, 500, 'nth'),
        };
      }
      return series;
    });
    this.data = this.seriesData[0]?.data || [];

    // Set up dimensions with space for title and legend
    const baseWidth = this.config.width || this.container.clientWidth || CHART_DEFAULTS.DEFAULT_WIDTH;
    const baseHeight = this.config.height || this.container.clientHeight || CHART_DEFAULTS.DEFAULT_HEIGHT;

    // Validate dimensions
    if (baseWidth <= 0 || baseHeight <= 0) {
      throw new Error(`Invalid dimensions: width=${baseWidth}, height=${baseHeight}. Must be positive numbers.`);
    }

    this.dimensions = this.calculateDimensions(baseWidth, baseHeight);

    // Initialize plugins
    this.plugins = this.config.plugins || [];
  }

  /**
   * Validate chart configuration
   */
  private validateConfig(config: BaseChartConfig): void {
    // Validate dimensions if provided
    if (config.width !== undefined && (config.width <= 0 || !isFinite(config.width))) {
      throw new Error(`Invalid width: ${config.width}. Must be a positive number.`);
    }
    if (config.height !== undefined && (config.height <= 0 || !isFinite(config.height))) {
      throw new Error(`Invalid height: ${config.height}. Must be a positive number.`);
    }

    // Validate theme
    const validThemes = ['default', 'midnight', 'minimal', 'tailwind', 'nord', 'high-contrast'];
    if (config.theme && !validThemes.includes(config.theme)) {
      throw new Error(`Invalid theme: ${config.theme}. Must be one of: ${validThemes.join(', ')}`);
    }

    // Validate colors array if provided
    if (config.colors) {
      if (!Array.isArray(config.colors)) {
        throw new Error('Colors must be an array of color strings');
      }
      if (config.colors.length === 0) {
        throw new Error('Colors array cannot be empty');
      }
      // Basic color format validation (hex, rgb, named colors)
      config.colors.forEach((color, index) => {
        if (typeof color !== 'string') {
          throw new Error(`Invalid color at index ${index}: ${color}. Must be a valid CSS color string.`);
        }

        // Allow hex, rgb/rgba, hsl/hsla formats, or CSS named colors
        const isHex = /^#[0-9a-fA-F]{3,8}$/.test(color);
        const isRgb = /^rgba?\(/.test(color);
        const isHsl = /^hsla?\(/.test(color);
        const isNamedColor = /^[a-z]{3,20}$/i.test(color); // Only letters, 3-20 chars

        if (!isHex && !isRgb && !isHsl && !isNamedColor) {
          throw new Error(`Invalid color at index ${index}: ${color}. Must be a valid CSS color string.`);
        }
      });
    }

    // Validate boolean flags
    if (config.animate !== undefined && typeof config.animate !== 'boolean') {
      throw new Error('animate must be a boolean');
    }
    if (config.responsive !== undefined && typeof config.responsive !== 'boolean') {
      throw new Error('responsive must be a boolean');
    }
    if (config.showLegend !== undefined && typeof config.showLegend !== 'boolean') {
      throw new Error('showLegend must be a boolean');
    }

    // Validate legend config if provided
    if (config.legend) {
      if (config.legend.show !== undefined && typeof config.legend.show !== 'boolean') {
        throw new Error('legend.show must be a boolean');
      }
      if (config.legend.position && !['top', 'bottom'].includes(config.legend.position)) {
        throw new Error(`Invalid legend.position: ${config.legend.position}. Must be 'top' or 'bottom'.`);
      }
      if (config.legend.align && !['left', 'center', 'right'].includes(config.legend.align)) {
        throw new Error(`Invalid legend.align: ${config.legend.align}. Must be 'left', 'center', or 'right'.`);
      }
    }
  }

  /**
   * Calculate dimensions - expand SVG to accommodate title and legend OUTSIDE the data area
   * The data area size remains unchanged, but we add extra space above/below for UI elements
   */
  protected calculateDimensions(width: number, height: number): Dimensions {
    const baseDims = getDefaultDimensions(width, height);

    // Calculate additional space needed for title and legend
    let extraTopSpace = 0;
    let extraBottomSpace = 0;

    // Title adds space at top
    if (this.config.title) {
      extraTopSpace += CHART_DEFAULTS.TITLE_FONT_SIZE + CHART_DEFAULTS.TITLE_BOTTOM_PADDING;
    }

    // Legend adds space based on position
    const showLegend = this.config.legend?.show ?? this.config.showLegend ?? false;
    if (showLegend && this.seriesData.length > 1) {
      const legendHeight = CHART_DEFAULTS.LEGEND_FONT_SIZE + CHART_DEFAULTS.LEGEND_PADDING;

      const position = this.config.legend?.position || 'top';
      if (position === 'top') {
        extraTopSpace += legendHeight;
      } else {
        extraBottomSpace += legendHeight;
      }
    }

    // Return expanded dimensions
    return {
      width: baseDims.width,
      height: baseDims.height + extraTopSpace + extraBottomSpace,
      margin: {
        top: baseDims.margin.top + extraTopSpace,
        right: baseDims.margin.right,
        bottom: baseDims.margin.bottom + extraBottomSpace,
        left: baseDims.margin.left,
      },
    };
  }

  /**
   * Plugin system methods
   */

  /**
   * Create plugin context for current state
   */
  protected createPluginContext(): PluginContext {
    const context: PluginContext = {
      chart: this as unknown as Chart,
      svg: this.svg,
      config: this.config,
      data: this.isMultiSeries ? this.seriesData : this.data,
      dimensions: this.dimensions,
      container: this.container,
      createSVGElement: <K extends keyof SVGElementTagNameMap>(
        tagName: K,
        attributes?: Record<string, string | number>
      ): SVGElementTagNameMap[K] => {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
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
  protected callPluginHook(hookName: keyof ChartPlugin): void {
    const context = this.createPluginContext();
    this.plugins.forEach((plugin) => {
      const hook = plugin[hookName];
      if (typeof hook === 'function') {
        try {
          (hook as Function).call(plugin, context);
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

  /**
   * Resolve each series' color (explicit per-series > `colors` config > theme
   * palette), record the resolved values in `resolvedSeriesColors`, and store the
   * applied color on each series — wrapped as `var(--cl-series-i, resolved)` when
   * `cssVars` is enabled so it can be overridden with plain CSS.
   */
  private assignSeriesColors(): void {
    const autoColors = generateSeriesColors(
      this.seriesData.length,
      this.config.colors,
      this.config.theme || 'default'
    );

    this.resolvedSeriesColors = this.seriesData.map(
      (series, index) => series.color || autoColors[index]
    );

    this.seriesData = this.seriesData.map((series, index) => ({
      ...series,
      color: this.useCssVars
        ? `var(--cl-series-${index}, ${this.resolvedSeriesColors[index]})`
        : this.resolvedSeriesColors[index],
    }));
  }

  /**
   * Theme colors for the current config. When `cssVars` is on, the `text`,
   * `grid`, `primary`, `foreground` and `seriesColors` fields are wrapped as
   * `var(--cl-*, fallback)` so the whole chart is re-themeable with CSS.
   * `background` is left raw here; the root token + background var are applied in
   * {@link createSVG}.
   */
  protected themeColors(): ReturnType<typeof getThemeColors> {
    const colors = getThemeColors(this.config.theme || 'default');
    if (!this.useCssVars) return colors;
    return {
      background: colors.background,
      foreground: `var(--cl-fg, ${colors.foreground})`,
      primary: `var(--cl-primary, ${colors.primary})`,
      grid: `var(--cl-grid, ${colors.grid})`,
      text: `var(--cl-text, ${colors.text})`,
      seriesColors: colors.seriesColors.map(
        (color, i) => `var(--cl-series-${i}, ${color})`
      ),
    };
  }

  /** Emit the theme's CSS custom properties on the SVG root (cssVars mode only). */
  private applyThemeVars(svg: SVGSVGElement): void {
    const colors = getThemeColors(this.config.theme || 'default');
    svg.style.setProperty('--cl-bg', colors.background);
    svg.style.setProperty('--cl-fg', colors.foreground);
    svg.style.setProperty('--cl-primary', colors.primary);
    svg.style.setProperty('--cl-grid', colors.grid);
    svg.style.setProperty('--cl-text', colors.text);
    this.resolvedSeriesColors.forEach((color, i) =>
      svg.style.setProperty(`--cl-series-${i}`, color)
    );
  }

  /**
   * Create the SVG element with accessibility attributes
   */
  protected createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(this.dimensions.width));
    svg.setAttribute('height', String(this.dimensions.height));
    svg.setAttribute('viewBox', `0 0 ${this.dimensions.width} ${this.dimensions.height}`);
    svg.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    // Apply theme background. In cssVars mode, publish the theme tokens on the
    // root and reference the background through `--cl-bg` so CSS can override it.
    const colors = getThemeColors(this.config.theme || 'default');
    if (this.useCssVars) {
      this.applyThemeVars(svg);
      svg.style.backgroundColor = `var(--cl-bg, ${colors.background})`;
    } else {
      svg.style.backgroundColor = colors.background;
    }

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
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = this.config.title || generateDefaultTitle(this.chartTypeName);
    svg.appendChild(title);

    const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
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

    return svg;
  }

  /**
   * The chart's type name derived from the concrete subclass, e.g. "Line".
   * NOTE: relies on `constructor.name`, which is mangled under minification;
   * a follow-up will have subclasses declare this explicitly.
   */
  protected get chartTypeName(): string {
    return this.constructor.name.replace('Chart', '');
  }

  /**
   * Add data table fallback for screen readers
   */
  private addDataTableFallback(svg: SVGSVGElement): void {
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', '0');
    foreignObject.setAttribute('height', '0');
    foreignObject.setAttribute('overflow', 'hidden');

    foreignObject.innerHTML = generateDataTableHTML({
      title: this.config.title || generateDefaultTitle(this.chartTypeName),
      data: this.data,
      seriesData: this.seriesData,
    });

    svg.appendChild(foreignObject);
  }

  /**
   * Setup keyboard navigation for the chart. The focus state machine lives in
   * KeyboardNavigator; listeners are registered through the tracked mechanism so
   * destroy() tears them down with everything else.
   */
  private setupKeyboardNavigation(svg: SVGSVGElement): void {
    this.keyboardNav = new KeyboardNavigator({
      svg,
      emit: (eventName, data) => this.emit(eventName, data),
      addListener: (element, event, handler) =>
        this.addEventListenerTracked(element as Element, event, handler),
    });
  }

  /**
   * Create a group element with transform
   */
  protected createGroup(x: number = 0, y: number = 0): SVGGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (x !== 0 || y !== 0) {
      g.setAttribute('transform', `translate(${x}, ${y})`);
    }
    return g;
  }

  /**
   * Render the chart
   */
  public render(): void {
    this.renderSync();
  }

  /**
   * Synchronous rendering (traditional approach)
   */
  private renderSync(): void {
    // Call beforeRender plugin hook
    this.callPluginHook('beforeRender');

    // Clear existing content and event listeners (with element pool optimization)
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    if (this.svg) {
      // Clear SVG children but reuse the SVG element (element pooling)
      while (this.svg.firstChild) {
        this.svg.removeChild(this.svg.firstChild);
      }
    } else {
      // First render: create SVG
      this.svg = this.createSVG();
      this.container.innerHTML = '';
      this.container.appendChild(this.svg);
    }

    // Render chart-specific content FIRST
    // This must happen before title/legend so we know the data bounds
    this.renderChart();

    // Render Phase 2 features (regions, reference lines, annotations)
    if (this.config.regions && this.config.regions.length > 0) {
      this.renderRegions();
    }
    if (this.config.referenceLines && this.config.referenceLines.length > 0) {
      this.renderReferenceLines();
    }
    if (this.config.annotations && this.config.annotations.length > 0) {
      this.renderAnnotations();
    }

    // Add title and legend AFTER chart rendering
    // This allows us to position them based on actual chart bounds
    if (this.config.title) {
      this.renderTitle();
    }

    const showLegend = this.config.legend?.show ?? this.config.showLegend ?? false;
    if (showLegend && this.seriesData.length > 1) {
      this.renderLegend();
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
    if (this.config.responsive && typeof ResizeObserver !== 'undefined') {
      this.setupResizeObserver();
    }

    // Call afterRender plugin hook
    this.callPluginHook('afterRender');
  }

  /**
   * Set up resize observer for responsive charts with throttling
   */
  private setupResizeObserver(): void {
    // Clean up existing observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Only resize if dimensions have actually changed and are valid
        if (width > 0 && height > 0) {
          const newWidth = this.config.width || width;
          const newHeight = this.config.height || height;

          // Update dimensions if changed - but throttle to avoid excessive re-renders
          if (newWidth !== this.dimensions.width || newHeight !== this.dimensions.height) {
            // Clear any pending resize
            if (this.resizeTimeout) {
              clearTimeout(this.resizeTimeout);
            }

            // Debounce the resize operation
            this.resizeTimeout = setTimeout(() => {
              this.dimensions = this.calculateDimensions(newWidth, newHeight);
              // Re-render without animation to avoid janky resizing
              const originalAnimate = this.config.animate;
              this.config.animate = false;
              this.render();
              this.config.animate = originalAnimate;
              // Call onResize plugin hook
              this.callPluginHook('onResize');
              this.resizeTimeout = null;
            }, CHART_DEFAULTS.RESIZE_DEBOUNCE_MS);
          }
        }
      }
    });

    this.resizeObserver.observe(this.container);
  }

  /**
   * Render title - positioned at top of SVG, outside the data area
   */
  protected renderTitle(): void {
    if (!this.svg) return;
    drawTitle(this.svg, this.config, this.dimensions);
  }

  /**
   * Render legend for multi-series charts
   */
  protected renderLegend(): void {
    if (!this.svg || this.seriesData.length <= 1) return;
    drawLegend(this.svg, this.config, this.dimensions, this.seriesData);
  }

  /**
   * Apply entrance animation
   */
  protected applyAnimation(): void {
    if (!this.svg) return;

    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    // Gate the entrance animation behind `prefers-reduced-motion: no-preference`
    // so users who ask their OS to reduce motion never see it (WCAG 2.3.3).
    style.textContent = `
      @keyframes chartFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (prefers-reduced-motion: no-preference) {
        .chart-animated {
          animation: chartFadeIn 0.6s ease-out;
        }
      }
    `;
    this.svg.appendChild(style);

    // Add animation class to main chart group
    const mainGroup = this.svg.querySelector('g.chart-main');
    if (mainGroup) {
      mainGroup.classList.add('chart-animated');
    }
  }

  /**
   * Update chart data
   */
  public update(data: DataPoint[] | FlexibleDataInput): void {
    // Call beforeUpdate plugin hook
    this.callPluginHook('beforeUpdate');

    // Re-normalize data
    const dataInput = data as FlexibleDataInput;

    this.isMultiSeries = isMultiSeriesData(dataInput);
    this.seriesData = normalizeToSeriesData(dataInput);
    this.data = this.seriesData[0]?.data || [];

    // Re-assign colors (records resolved colors + var-wraps when cssVars)
    this.assignSeriesColors();

    // Automatic data sampling for performance (500+ points)
    this.seriesData = this.seriesData.map(series => {
      if (series.data.length > 500) {
        return {
          ...series,
          data: autoDownsample(series.data, 500, 'nth'),
        };
      }
      return series;
    });
    this.data = this.seriesData[0]?.data || [];

    this.render();

    // Call afterUpdate plugin hook
    this.callPluginHook('afterUpdate');
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

    // Clean up element pool
    if (this.elementPool) {
      this.elementPool.clear();
      this.elementPool = null;
    }

    // Remove SVG
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.svg = null;

    // Clear event handlers
    this.eventHandlers.clear();

    // Release the keyboard navigator (its listeners were removed above)
    if (this.keyboardNav) {
      this.keyboardNav = null;
    }
  }

  /**
   * Export as SVG string
   * Note: Chart must be rendered before calling this method
   */
  public toSVG(): string {
    if (!this.svg) {
      throw new Error('Chart must be rendered before calling toSVG(). Call render() first.');
    }
    return this.svg.outerHTML;
  }

  /**
   * Render reference lines
   */
  protected renderReferenceLines(): void {
    if (!this.svg || !this.chartBounds) return;
    drawReferenceLines(this.svg, this.config, this.dimensions, this.chartBounds);
  }

  /**
   * Render annotations
   */
  protected renderAnnotations(): void {
    if (!this.svg || !this.chartBounds) return;
    drawAnnotations(this.svg, this.config, this.dimensions, this.chartBounds);
  }

  /**
   * Render region highlighting
   */
  protected renderRegions(): void {
    if (!this.svg || !this.chartBounds) return;
    drawRegions(this.svg, this.config, this.dimensions, this.chartBounds);
  }

  /**
   * Render categorical X-axis with linear Y-axis (most common: LineChart, BarChart, AreaChart)
   */
  protected renderCategoricalXLinearYAxes(
    group: SVGGElement,
    xValues: string[],
    yMin: number,
    yMax: number,
    chartWidth: number,
    chartHeight: number,
    colors: ReturnType<typeof getThemeColors>
  ): void {
    drawCategoricalXLinearYAxes(
      group,
      xValues,
      yMin,
      yMax,
      chartWidth,
      chartHeight,
      colors,
      this.config.valueFormatter
    );
  }

  /**
   * Render linear X-axis with linear Y-axis (ScatterChart)
   */
  protected renderLinearXLinearYAxes(
    group: SVGGElement,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    chartWidth: number,
    chartHeight: number,
    colors: ReturnType<typeof getThemeColors>
  ): void {
    drawLinearXLinearYAxes(
      group,
      xMin,
      xMax,
      yMin,
      yMax,
      chartWidth,
      chartHeight,
      colors,
      this.config.valueFormatter
    );
  }

  /**
   * Render linear X-axis with categorical Y-axis (horizontal BarChart)
   */
  protected renderLinearXCategoricalYAxes(
    group: SVGGElement,
    yValues: string[],
    xMin: number,
    xMax: number,
    chartWidth: number,
    chartHeight: number,
    colors: ReturnType<typeof getThemeColors>
  ): void {
    drawLinearXCategoricalYAxes(
      group,
      yValues,
      xMin,
      xMax,
      chartWidth,
      chartHeight,
      colors,
      this.config.valueFormatter
    );
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract renderChart(): void;
}