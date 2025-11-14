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
  createLinearScale,
  createBandScale,
  calculateNiceTicks,
  autoDownsample,
  ElementPool,
} from '../utils';

/**
 * Default constants for chart rendering
 */
const CHART_DEFAULTS = {
  // Title
  TITLE_FONT_SIZE: 18,
  TITLE_TOP_PADDING: 5,
  TITLE_BOTTOM_PADDING: 10,

  // Legend
  LEGEND_FONT_SIZE: 12,
  LEGEND_PADDING: 15,
  LEGEND_ICON_SIZE: 12,
  LEGEND_ICON_MARGIN: 6,
  LEGEND_ITEM_SPACING: 20,

  // Axes
  AXIS_LABEL_FONT_SIZE: 12,
  AXIS_LABEL_OFFSET: 10,
  AXIS_LABEL_BOTTOM_OFFSET: 20,

  // Resize
  RESIZE_DEBOUNCE_MS: 150,

  // Default dimensions
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 400,
} as const;

export abstract class BaseChart implements Chart {
  protected container: HTMLElement;
  protected config: BaseChartConfig;
  protected svg: SVGSVGElement | null = null;
  protected dimensions: Dimensions;
  protected data: DataPoint[]; // Legacy: for single-series backward compatibility
  protected seriesData: SeriesData[]; // New: normalized multi-series data
  protected isMultiSeries: boolean;
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

  // Chart bounds for Phase 2 features (set by subclasses)
  protected chartBounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    xValues?: string[]; // For categorical x-axis
  } | null = null;

  // Keyboard navigation (Phase 3)
  private focusedElementIndex: number = -1;
  private focusableElements: SVGElement[] = [];
  private liveRegion: HTMLElement | null = null;

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

    // Auto-assign colors to series
    const autoColors = generateSeriesColors(
      this.seriesData.length,
      this.config.colors,
      this.config.theme || 'default'
    );

    this.seriesData = this.seriesData.map((series, index) => ({
      ...series,
      color: series.color || autoColors[index],
    }));

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
    const validThemes = ['default', 'midnight', 'minimal'];
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

  /**
   * Create the SVG element with accessibility attributes
   */
  protected createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(this.dimensions.width));
    svg.setAttribute('height', String(this.dimensions.height));
    svg.setAttribute('viewBox', `0 0 ${this.dimensions.width} ${this.dimensions.height}`);
    svg.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    // Apply theme background
    const colors = getThemeColors(this.config.theme || 'default');
    svg.style.backgroundColor = colors.background;

    // ARIA role and label for accessibility
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', this.generateAriaLabel());

    // Make SVG focusable for keyboard navigation
    svg.setAttribute('tabindex', '0');

    // Title and description for screen readers
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = this.config.title || this.generateDefaultTitle();
    svg.appendChild(title);

    const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
    desc.textContent = this.generateDescription();
    svg.appendChild(desc);

    // Add data table fallback for screen readers
    this.addDataTableFallback(svg);

    // Setup keyboard navigation
    this.setupKeyboardNavigation(svg);

    // Inject accessibility styles if not already present
    this.injectAccessibilityStyles();

    return svg;
  }

  /**
   * Generate ARIA label for the chart
   */
  private generateAriaLabel(): string {
    const chartType = this.constructor.name.replace('Chart', '').toLowerCase();
    const title = this.config.title || 'Untitled chart';
    const seriesCount = this.seriesData.length;
    const totalPoints = this.seriesData.reduce((sum, s) => sum + s.data.length, 0);

    if (seriesCount > 1) {
      return `${chartType} chart: ${title} with ${seriesCount} data series and ${totalPoints} total data points`;
    }
    return `${chartType} chart: ${title} with ${this.data.length} data points`;
  }

  /**
   * Generate default title if none provided
   */
  private generateDefaultTitle(): string {
    const chartType = this.constructor.name.replace('Chart', '');
    return `${chartType} Chart`;
  }

  /**
   * Generate descriptive text for screen readers
   */
  private generateDescription(): string {
    const chartType = this.constructor.name.replace('Chart', '').toLowerCase();

    if (this.data.length === 0) {
      return `Empty ${chartType} chart with no data.`;
    }

    // Calculate min, max, and trend
    const allYValues = this.seriesData.flatMap(s => s.data.map(d => d.y));
    const min = Math.min(...allYValues);
    const max = Math.max(...allYValues);

    const firstPoint = this.data[0];
    const lastPoint = this.data[this.data.length - 1];
    const trend = this.calculateTrend();

    let description = `${chartType} chart showing data from ${firstPoint.x} to ${lastPoint.x}. `;
    description += `Values range from ${min.toFixed(2)} to ${max.toFixed(2)}`;

    if (trend) {
      description += `, with a ${trend} trend`;
    }

    if (this.seriesData.length > 1) {
      description += `. Chart contains ${this.seriesData.length} data series: ${this.seriesData.map(s => s.name).join(', ')}`;
    }

    description += '.';
    return description;
  }

  /**
   * Calculate trend from first to last data point
   */
  private calculateTrend(): string {
    if (this.data.length < 2) return '';

    const first = this.data[0].y;
    const last = this.data[this.data.length - 1].y;

    if (first === 0) return '';

    const change = ((last - first) / Math.abs(first)) * 100;

    if (change > 10) return 'strong upward';
    if (change > 2) return 'slight upward';
    if (change < -10) return 'strong downward';
    if (change < -2) return 'slight downward';
    return 'relatively flat';
  }

  /**
   * Add data table fallback for screen readers
   */
  private addDataTableFallback(svg: SVGSVGElement): void {
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('width', '0');
    foreignObject.setAttribute('height', '0');
    foreignObject.setAttribute('overflow', 'hidden');

    const tableHTML = this.generateDataTableHTML();
    foreignObject.innerHTML = tableHTML;

    svg.appendChild(foreignObject);
  }

  /**
   * Generate HTML table of chart data for screen readers
   */
  private generateDataTableHTML(): string {
    const title = this.config.title || this.generateDefaultTitle();

    if (this.seriesData.length === 1) {
      // Single series table
      const rows = this.data.map(point =>
        `<tr><td>${point.x}</td><td>${point.y}</td></tr>`
      ).join('');

      return `
        <table class="sr-only" aria-label="Chart data table">
          <caption>${title} - Data Table</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    } else {
      // Multi-series table
      const seriesHeaders = this.seriesData.map(s =>
        `<th scope="col">${s.name}</th>`
      ).join('');

      // Get all unique x values
      const allXValues = Array.from(new Set(
        this.seriesData.flatMap(s => s.data.map(d => String(d.x)))
      ));

      const rows = allXValues.map(x => {
        const cells = this.seriesData.map(series => {
          const point = series.data.find(d => String(d.x) === x);
          return `<td>${point ? point.y : '-'}</td>`;
        }).join('');

        return `<tr><th scope="row">${x}</th>${cells}</tr>`;
      }).join('');

      return `
        <table class="sr-only" aria-label="Chart data table">
          <caption>${title} - Data Table</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              ${seriesHeaders}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }
  }

  /**
   * Inject accessibility CSS styles
   */
  private injectAccessibilityStyles(): void {
    // Check if styles already injected
    if (document.getElementById('chartlite-a11y-styles')) return;

    const style = document.createElement('style');
    style.id = 'chartlite-a11y-styles';
    style.textContent = `
      /* Chartlite Accessibility Styles */

      /* Screen reader only content */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      /* Chart focus indicator */
      svg[role="img"]:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 4px;
      }

      /* Remove default outline for mouse users */
      svg[role="img"]:focus:not(:focus-visible) {
        outline: none;
      }

      /* Data point focus indicator */
      .data-point-focused {
        stroke: #2563eb !important;
        stroke-width: 3 !important;
        filter: drop-shadow(0 0 4px rgba(37, 99, 235, 0.5));
      }

      /* Increase size for focused circles */
      circle.data-point-focused {
        r: 6;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        svg[role="img"]:focus-visible {
          outline: 3px solid CanvasText;
          outline-offset: 4px;
        }

        .data-point-focused {
          stroke: Highlight !important;
          stroke-width: 4 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup keyboard navigation for the chart
   */
  private setupKeyboardNavigation(svg: SVGSVGElement): void {
    // Add keyboard event listeners
    const handleKeyDown = (e: Event) => this.handleKeyDown(e as KeyboardEvent);
    const handleFocus = () => this.handleFocus();
    const handleBlur = () => this.handleBlur();

    this.addEventListenerTracked(svg, 'keydown', handleKeyDown);
    this.addEventListenerTracked(svg, 'focus', handleFocus);
    this.addEventListenerTracked(svg, 'blur', handleBlur);
  }

  /**
   * Handle focus event on chart
   */
  private handleFocus(): void {
    // Chart is now focused - collect focusable elements
    this.collectFocusableElements();
  }

  /**
   * Handle blur event on chart
   */
  private handleBlur(): void {
    // Clear focus from data points
    this.clearDataPointFocus();
    this.focusedElementIndex = -1;
  }

  /**
   * Collect all focusable data point elements
   */
  private collectFocusableElements(): void {
    if (!this.svg) return;

    // Find all data points with the data-point class
    const elements = this.svg.querySelectorAll('.data-point');
    this.focusableElements = Array.from(elements) as SVGElement[];
  }

  /**
   * Handle keyboard events for navigation
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default scrolling for arrow keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        this.focusNextElement();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        this.focusPreviousElement();
        break;

      case 'Home':
        this.focusFirstElement();
        break;

      case 'End':
        this.focusLastElement();
        break;

      case 'Enter':
      case ' ':
        this.activateCurrentElement();
        break;

      case 'Escape':
        this.clearDataPointFocus();
        this.focusedElementIndex = -1;
        // Blur the SVG to exit navigation
        if (this.svg) {
          this.svg.blur();
        }
        break;
    }
  }

  /**
   * Focus on the next data point
   */
  private focusNextElement(): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }

    if (this.focusableElements.length === 0) return;

    this.focusedElementIndex = (this.focusedElementIndex + 1) % this.focusableElements.length;
    this.applyFocusToElement(this.focusedElementIndex);
    this.announceToScreenReader();
  }

  /**
   * Focus on the previous data point
   */
  private focusPreviousElement(): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }

    if (this.focusableElements.length === 0) return;

    this.focusedElementIndex = this.focusedElementIndex <= 0
      ? this.focusableElements.length - 1
      : this.focusedElementIndex - 1;
    this.applyFocusToElement(this.focusedElementIndex);
    this.announceToScreenReader();
  }

  /**
   * Focus on the first data point
   */
  private focusFirstElement(): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }

    if (this.focusableElements.length === 0) return;

    this.focusedElementIndex = 0;
    this.applyFocusToElement(this.focusedElementIndex);
    this.announceToScreenReader();
  }

  /**
   * Focus on the last data point
   */
  private focusLastElement(): void {
    if (this.focusableElements.length === 0) {
      this.collectFocusableElements();
    }

    if (this.focusableElements.length === 0) return;

    this.focusedElementIndex = this.focusableElements.length - 1;
    this.applyFocusToElement(this.focusedElementIndex);
    this.announceToScreenReader();
  }

  /**
   * Apply visual focus to an element
   */
  private applyFocusToElement(index: number): void {
    // Remove previous focus
    this.clearDataPointFocus();

    const element = this.focusableElements[index];
    if (!element) return;

    // Add focus class
    element.classList.add('data-point-focused');

    // Store current focus state
    element.setAttribute('data-focused', 'true');
  }

  /**
   * Clear focus from all data points
   */
  private clearDataPointFocus(): void {
    this.focusableElements.forEach(el => {
      el.classList.remove('data-point-focused');
      el.removeAttribute('data-focused');
    });
  }

  /**
   * Activate the currently focused element (for Enter/Space)
   */
  private activateCurrentElement(): void {
    if (this.focusedElementIndex < 0 || this.focusedElementIndex >= this.focusableElements.length) {
      return;
    }

    const element = this.focusableElements[this.focusedElementIndex];
    if (!element) return;

    // Emit event for plugins to handle (e.g., tooltip plugin)
    this.emit('datapoint:activate', {
      element,
      index: this.focusedElementIndex,
      ariaLabel: element.getAttribute('aria-label'),
    });
  }

  /**
   * Announce focused element to screen readers
   */
  private announceToScreenReader(): void {
    if (this.focusedElementIndex < 0 || this.focusedElementIndex >= this.focusableElements.length) {
      return;
    }

    const element = this.focusableElements[this.focusedElementIndex];
    if (!element) return;

    const ariaLabel = element.getAttribute('aria-label') || '';

    // Create or get live region
    if (!this.liveRegion) {
      this.liveRegion = document.getElementById('chartlite-live-region');

      if (!this.liveRegion) {
        this.liveRegion = document.createElement('div');
        this.liveRegion.id = 'chartlite-live-region';
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        document.body.appendChild(this.liveRegion);
      }
    }

    // Update announcement
    this.liveRegion.textContent = ariaLabel;
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

    const colors = getThemeColors(this.config.theme || 'default');

    // Position title near the top of SVG
    const titleY = CHART_DEFAULTS.TITLE_FONT_SIZE + CHART_DEFAULTS.TITLE_TOP_PADDING;

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(this.dimensions.width / 2));
    text.setAttribute('y', String(titleY));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', colors.text);
    text.setAttribute('font-size', String(CHART_DEFAULTS.TITLE_FONT_SIZE));
    text.setAttribute('font-weight', '600');
    text.textContent = this.config.title || '';

    this.svg.appendChild(text);
  }

  /**
   * Render legend for multi-series charts
   */
  protected renderLegend(): void {
    if (!this.svg || this.seriesData.length <= 1) return;

    const colors = getThemeColors(this.config.theme || 'default');
    const position = this.config.legend?.position || 'top';

    // Create legend group
    const legendGroup = this.createGroup();
    legendGroup.classList.add('chart-legend');

    // Calculate legend item dimensions
    const itemSpacing = CHART_DEFAULTS.LEGEND_ITEM_SPACING;
    const iconSize = CHART_DEFAULTS.LEGEND_ICON_SIZE;
    const iconMargin = CHART_DEFAULTS.LEGEND_ICON_MARGIN;

    // Render horizontal legend (only layout supported)
    let currentX = 0;
    const itemWidths: number[] = [];

    // First pass: render items and measure their actual widths
    this.seriesData.forEach((series) => {
      const itemGroup = this.createGroup(currentX, 0);

      // Color indicator (square)
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', String(iconSize));
      rect.setAttribute('height', String(iconSize));
      rect.setAttribute('fill', series.color || colors.primary);
      rect.setAttribute('rx', '2');
      itemGroup.appendChild(rect);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(iconSize + iconMargin));
      label.setAttribute('y', String(iconSize / 2));
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', String(CHART_DEFAULTS.LEGEND_FONT_SIZE));
      label.textContent = series.name;
      itemGroup.appendChild(label);

      legendGroup.appendChild(itemGroup);

      // Measure actual text width using getBBox()
      // Temporarily append to SVG to measure
      this.svg!.appendChild(legendGroup);
      let textWidth: number;
      try {
        const bbox = label.getBBox();
        textWidth = bbox.width;
      } catch (e) {
        // getBBox not available (e.g., in test environment or SSR)
        // Fallback to estimation: ~7px per character
        textWidth = series.name.length * 7;
      }
      const itemWidth = iconSize + iconMargin + textWidth;
      itemWidths.push(itemWidth);
      this.svg!.removeChild(legendGroup);

      currentX += itemWidth + itemSpacing;
    });

    // Calculate total width
    const totalWidth = itemWidths.reduce((sum, w) => sum + w, 0) + itemSpacing * (this.seriesData.length - 1);

    // Calculate horizontal position based on alignment
    const align = this.config.legend?.align || 'left';
    const chartWidth = this.dimensions.width - this.dimensions.margin.left - this.dimensions.margin.right;

    let legendX: number;
    if (align === 'center') {
      legendX = this.dimensions.margin.left + (chartWidth - totalWidth) / 2;
    } else if (align === 'right') {
      legendX = this.dimensions.margin.left + chartWidth - totalWidth;
    } else {
      legendX = this.dimensions.margin.left;
    }

    // Position legend in the expanded margin area (outside data area)
    if (position === 'top') {
      let legendY: number;

      if (this.config.title) {
        // Title is present - position legend below title
        const titleY = CHART_DEFAULTS.TITLE_FONT_SIZE + CHART_DEFAULTS.TITLE_TOP_PADDING;
        legendY = titleY + CHART_DEFAULTS.TITLE_BOTTOM_PADDING;
      } else {
        // No title - position legend near top of SVG
        legendY = CHART_DEFAULTS.LEGEND_FONT_SIZE + CHART_DEFAULTS.TITLE_TOP_PADDING;
      }

      legendGroup.setAttribute('transform', `translate(${legendX}, ${legendY})`);
    } else {
      // Position legend in the bottom margin area
      const baseDims = getDefaultDimensions(this.dimensions.width, CHART_DEFAULTS.DEFAULT_HEIGHT);
      const dataAreaBottom = this.dimensions.height - this.dimensions.margin.bottom + baseDims.margin.bottom;
      const legendY = dataAreaBottom + CHART_DEFAULTS.LEGEND_FONT_SIZE;
      legendGroup.setAttribute('transform', `translate(${legendX}, ${legendY})`);
    }

    this.svg.appendChild(legendGroup);
  }

  /**
   * Apply entrance animation
   */
  protected applyAnimation(): void {
    if (!this.svg) return;

    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      @keyframes chartFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .chart-animated {
        animation: chartFadeIn 0.6s ease-out;
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

    // Re-assign colors
    const autoColors = generateSeriesColors(
      this.seriesData.length,
      this.config.colors,
      this.config.theme || 'default'
    );

    this.seriesData = this.seriesData.map((series, index) => ({
      ...series,
      color: series.color || autoColors[index],
    }));

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
    if (!this.svg || !this.config.referenceLines || !this.chartBounds) return;

    const colors = getThemeColors(this.config.theme || 'default');
    const { margin } = this.dimensions;
    const chartWidth = this.dimensions.width - margin.left - margin.right;
    const chartHeight = this.dimensions.height - margin.top - margin.bottom;

    // Store chartBounds in local variable for TypeScript null safety
    const bounds = this.chartBounds;

    // Create a group for reference lines
    const refLinesGroup = this.createGroup(margin.left, margin.top);
    refLinesGroup.classList.add('chart-reference-lines');

    this.config.referenceLines.forEach((refLine) => {
      const {
        axis,
        value,
        label,
        color = colors.grid,
        style = 'dashed',
        strokeWidth = 2,
        labelPosition = 'end',
      } = refLine;

      let x1: number, y1: number, x2: number, y2: number;
      let labelX: number = 0;
      let labelY: number = 0;
      let textAnchor: 'start' | 'middle' | 'end' = 'start';

      if (axis === 'y') {
        // Horizontal reference line
        const yScale = createLinearScale(
          [bounds.yMin, bounds.yMax],
          [chartHeight, 0]
        );
        const y = yScale(value as number);

        x1 = 0;
        y1 = y;
        x2 = chartWidth;
        y2 = y;

        // Label positioning
        if (labelPosition === 'start') {
          labelX = 5;
          labelY = y - 5;
          textAnchor = 'start';
        } else if (labelPosition === 'middle') {
          labelX = chartWidth / 2;
          labelY = y - 5;
          textAnchor = 'middle';
        } else {
          labelX = chartWidth - 5;
          labelY = y - 5;
          textAnchor = 'end';
        }
      } else {
        // Vertical reference line
        let x: number;
        if (bounds.xValues) {
          // Categorical x-axis
          const xScale = createBandScale(bounds.xValues, [0, chartWidth], 0);
          x = xScale.scale(String(value)) + xScale.bandwidth / 2;
        } else {
          // Numeric x-axis
          const xScale = createLinearScale(
            [bounds.xMin, bounds.xMax],
            [0, chartWidth]
          );
          x = xScale(value as number);
        }

        x1 = x;
        y1 = 0;
        x2 = x;
        y2 = chartHeight;

        // Label positioning
        if (labelPosition === 'start') {
          labelX = x + 5;
          labelY = 15;
          textAnchor = 'start';
        } else if (labelPosition === 'middle') {
          labelX = x + 5;
          labelY = chartHeight / 2;
          textAnchor = 'start';
        } else {
          labelX = x + 5;
          labelY = chartHeight - 5;
          textAnchor = 'start';
        }
      }

      // Draw the line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', String(strokeWidth));

      // Apply line style
      if (style === 'dashed') {
        line.setAttribute('stroke-dasharray', '8 4');
      } else if (style === 'dotted') {
        line.setAttribute('stroke-dasharray', '2 2');
      }

      refLinesGroup.appendChild(line);

      // Add label if provided
      if (label) {
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', String(labelX));
        labelText.setAttribute('y', String(labelY));
        labelText.setAttribute('text-anchor', textAnchor);
        labelText.setAttribute('fill', color);
        labelText.setAttribute('font-size', '11');
        labelText.setAttribute('font-weight', '500');
        labelText.textContent = label;
        refLinesGroup.appendChild(labelText);
      }
    });

    this.svg.appendChild(refLinesGroup);
  }

  /**
   * Render annotations
   */
  protected renderAnnotations(): void {
    if (!this.svg || !this.config.annotations || !this.chartBounds) return;

    const colors = getThemeColors(this.config.theme || 'default');
    const { margin } = this.dimensions;
    const chartWidth = this.dimensions.width - margin.left - margin.right;
    const chartHeight = this.dimensions.height - margin.top - margin.bottom;

    // Store chartBounds in local variable for TypeScript null safety
    const bounds = this.chartBounds;

    // Create a group for annotations
    const annotationsGroup = this.createGroup(margin.left, margin.top);
    annotationsGroup.classList.add('chart-annotations');

    this.config.annotations.forEach((annotation) => {
      const {
        x: xValue,
        y: yValue,
        text,
        color = colors.text,
        fontSize = 12,
        fontWeight = 'normal',
        showArrow = false,
        arrowColor = color,
        offset = {},
        anchor = 'top',
      } = annotation;

      // Calculate point position
      let pointX: number;
      if (bounds.xValues) {
        const xScale = createBandScale(bounds.xValues, [0, chartWidth], 0);
        pointX = xScale.scale(String(xValue)) + xScale.bandwidth / 2;
      } else {
        const xScale = createLinearScale(
          [bounds.xMin, bounds.xMax],
          [0, chartWidth]
        );
        pointX = xScale(xValue as number);
      }

      const yScale = createLinearScale(
        [bounds.yMin, bounds.yMax],
        [chartHeight, 0]
      );
      const pointY = yScale(yValue);

      // Calculate text position based on anchor
      let textX = pointX + (offset.x || 0);
      let textY = pointY + (offset.y || 0);
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      let dominantBaseline: 'auto' | 'middle' | 'hanging' = 'middle';

      const defaultOffset = 15;

      switch (anchor) {
        case 'top':
          textY -= defaultOffset;
          textAnchor = 'middle';
          dominantBaseline = 'auto';
          break;
        case 'bottom':
          textY += defaultOffset;
          textAnchor = 'middle';
          dominantBaseline = 'hanging';
          break;
        case 'left':
          textX -= defaultOffset;
          textAnchor = 'end';
          dominantBaseline = 'middle';
          break;
        case 'right':
          textX += defaultOffset;
          textAnchor = 'start';
          dominantBaseline = 'middle';
          break;
        case 'top-left':
          textX -= defaultOffset;
          textY -= defaultOffset;
          textAnchor = 'end';
          dominantBaseline = 'auto';
          break;
        case 'top-right':
          textX += defaultOffset;
          textY -= defaultOffset;
          textAnchor = 'start';
          dominantBaseline = 'auto';
          break;
        case 'bottom-left':
          textX -= defaultOffset;
          textY += defaultOffset;
          textAnchor = 'end';
          dominantBaseline = 'hanging';
          break;
        case 'bottom-right':
          textX += defaultOffset;
          textY += defaultOffset;
          textAnchor = 'start';
          dominantBaseline = 'hanging';
          break;
      }

      // Draw arrow if enabled
      if (showArrow) {
        const arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arrowLine.setAttribute('x1', String(pointX));
        arrowLine.setAttribute('y1', String(pointY));
        arrowLine.setAttribute('x2', String(textX));
        arrowLine.setAttribute('y2', String(textY));
        arrowLine.setAttribute('stroke', arrowColor);
        arrowLine.setAttribute('stroke-width', '1');
        arrowLine.setAttribute('opacity', '0.6');
        annotationsGroup.appendChild(arrowLine);

        // Draw arrowhead
        const arrowSize = 5;
        const angle = Math.atan2(textY - pointY, textX - pointX);
        const arrowPoints = [
          `${pointX},${pointY}`,
          `${pointX - arrowSize * Math.cos(angle - Math.PI / 6)},${
            pointY - arrowSize * Math.sin(angle - Math.PI / 6)
          }`,
          `${pointX - arrowSize * Math.cos(angle + Math.PI / 6)},${
            pointY - arrowSize * Math.sin(angle + Math.PI / 6)
          }`,
        ].join(' ');

        const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrowHead.setAttribute('points', arrowPoints);
        arrowHead.setAttribute('fill', arrowColor);
        arrowHead.setAttribute('opacity', '0.6');
        annotationsGroup.appendChild(arrowHead);
      }

      // Draw text
      const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', String(textX));
      textElement.setAttribute('y', String(textY));
      textElement.setAttribute('text-anchor', textAnchor);
      textElement.setAttribute('dominant-baseline', dominantBaseline);
      textElement.setAttribute('fill', color);
      textElement.setAttribute('font-size', String(fontSize));
      textElement.setAttribute('font-weight', fontWeight);
      textElement.textContent = text;
      annotationsGroup.appendChild(textElement);
    });

    this.svg.appendChild(annotationsGroup);
  }

  /**
   * Render region highlighting
   */
  protected renderRegions(): void {
    if (!this.svg || !this.config.regions || !this.chartBounds) return;

    const colors = getThemeColors(this.config.theme || 'default');
    const { margin } = this.dimensions;
    const chartWidth = this.dimensions.width - margin.left - margin.right;
    const chartHeight = this.dimensions.height - margin.top - margin.bottom;

    // Store chartBounds in local variable for TypeScript null safety
    const bounds = this.chartBounds;

    // Create a group for regions (render first so they appear behind data)
    const regionsGroup = this.createGroup(margin.left, margin.top);
    regionsGroup.classList.add('chart-regions');

    // Insert regions group as first child of SVG (behind everything)
    const mainGroup = this.svg.querySelector('.chart-main');
    if (mainGroup) {
      this.svg.insertBefore(regionsGroup, mainGroup);
    } else {
      this.svg.appendChild(regionsGroup);
    }

    this.config.regions.forEach((region) => {
      const {
        axis,
        start,
        end,
        label,
        color = colors.primary,
        opacity = 0.1,
        labelPosition = 'middle',
      } = region;

      let rectX: number, rectY: number, rectWidth: number, rectHeight: number;
      let labelX: number = 0;
      let labelY: number = 0;
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';

      if (axis === 'x') {
        // Vertical region
        let startX: number, endX: number;

        if (bounds.xValues) {
          const xScale = createBandScale(bounds.xValues, [0, chartWidth], 0);
          startX = xScale.scale(String(start));
          endX = xScale.scale(String(end)) + xScale.bandwidth;
        } else {
          const xScale = createLinearScale(
            [bounds.xMin, bounds.xMax],
            [0, chartWidth]
          );
          startX = xScale(start as number);
          endX = xScale(end as number);
        }

        rectX = startX;
        rectY = 0;
        rectWidth = endX - startX;
        rectHeight = chartHeight;

        // Label positioning
        if (labelPosition === 'start') {
          labelX = startX + 5;
        } else if (labelPosition === 'end') {
          labelX = endX - 5;
        } else {
          labelX = (startX + endX) / 2;
        }
        labelY = 15;
      } else {
        // Horizontal region
        const yScale = createLinearScale(
          [bounds.yMin, bounds.yMax],
          [chartHeight, 0]
        );
        const startY = yScale(start as number);
        const endY = yScale(end as number);

        rectX = 0;
        rectY = endY;
        rectWidth = chartWidth;
        rectHeight = startY - endY;

        // Label positioning
        if (labelPosition === 'start') {
          labelY = startY - 5;
        } else if (labelPosition === 'end') {
          labelY = endY + 15;
        } else {
          labelY = (startY + endY) / 2;
        }
        labelX = 10;
        textAnchor = 'start';
      }

      // Draw rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(rectX));
      rect.setAttribute('y', String(rectY));
      rect.setAttribute('width', String(rectWidth));
      rect.setAttribute('height', String(rectHeight));
      rect.setAttribute('fill', color);
      rect.setAttribute('opacity', String(opacity));
      regionsGroup.appendChild(rect);

      // Add label if provided
      if (label) {
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', String(labelX));
        labelText.setAttribute('y', String(labelY));
        labelText.setAttribute('text-anchor', textAnchor);
        labelText.setAttribute('fill', color);
        labelText.setAttribute('font-size', '11');
        labelText.setAttribute('font-weight', '600');
        labelText.setAttribute('opacity', String(Math.min(opacity * 5, 0.8))); // Make label more visible
        labelText.textContent = label;
        regionsGroup.appendChild(labelText);
      }
    });
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
    // Y-axis line
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', String(chartHeight));
    yAxis.setAttribute('stroke', colors.grid);
    yAxis.setAttribute('stroke-width', '1');
    group.appendChild(yAxis);

    // X-axis line
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', '0');
    xAxis.setAttribute('y1', String(chartHeight));
    xAxis.setAttribute('x2', String(chartWidth));
    xAxis.setAttribute('y2', String(chartHeight));
    xAxis.setAttribute('stroke', colors.grid);
    xAxis.setAttribute('stroke-width', '1');
    group.appendChild(xAxis);

    // Y-axis labels and grid lines
    const yTicks = calculateNiceTicks(yMin, yMax, 5);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    yTicks.forEach((tick) => {
      const y = yScale(tick);

      // Grid line
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', '0');
      gridLine.setAttribute('y1', String(y));
      gridLine.setAttribute('x2', String(chartWidth));
      gridLine.setAttribute('y2', String(y));
      gridLine.setAttribute('stroke', colors.grid);
      gridLine.setAttribute('stroke-width', '1');
      gridLine.setAttribute('opacity', '0.3');
      group.appendChild(gridLine);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(-CHART_DEFAULTS.AXIS_LABEL_OFFSET));
      label.setAttribute('y', String(y));
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
      label.textContent = String(tick);
      group.appendChild(label);
    });

    // X-axis labels
    const xScale = createBandScale(xValues, [0, chartWidth], 0);
    xValues.forEach((value) => {
      const x = xScale.scale(value) + xScale.bandwidth / 2;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(x));
      label.setAttribute('y', String(chartHeight + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
      label.textContent = value;
      group.appendChild(label);
    });
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
    // Y-axis line
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', String(chartHeight));
    yAxis.setAttribute('stroke', colors.grid);
    yAxis.setAttribute('stroke-width', '1');
    group.appendChild(yAxis);

    // X-axis line
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', '0');
    xAxis.setAttribute('y1', String(chartHeight));
    xAxis.setAttribute('x2', String(chartWidth));
    xAxis.setAttribute('y2', String(chartHeight));
    xAxis.setAttribute('stroke', colors.grid);
    xAxis.setAttribute('stroke-width', '1');
    group.appendChild(xAxis);

    // Y-axis labels and grid lines
    const yTicks = calculateNiceTicks(yMin, yMax, 5);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    yTicks.forEach((tick) => {
      const y = yScale(tick);

      // Grid line
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', '0');
      gridLine.setAttribute('y1', String(y));
      gridLine.setAttribute('x2', String(chartWidth));
      gridLine.setAttribute('y2', String(y));
      gridLine.setAttribute('stroke', colors.grid);
      gridLine.setAttribute('stroke-width', '1');
      gridLine.setAttribute('opacity', '0.3');
      group.appendChild(gridLine);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(-CHART_DEFAULTS.AXIS_LABEL_OFFSET));
      label.setAttribute('y', String(y));
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
      label.textContent = String(tick);
      group.appendChild(label);
    });

    // X-axis labels and grid lines
    const xTicks = calculateNiceTicks(xMin, xMax, 5);
    const xScale = createLinearScale([xMin, xMax], [0, chartWidth]);

    xTicks.forEach((tick) => {
      const x = xScale(tick);

      // Grid line (vertical)
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', String(x));
      gridLine.setAttribute('y1', '0');
      gridLine.setAttribute('x2', String(x));
      gridLine.setAttribute('y2', String(chartHeight));
      gridLine.setAttribute('stroke', colors.grid);
      gridLine.setAttribute('stroke-width', '1');
      gridLine.setAttribute('opacity', '0.3');
      group.appendChild(gridLine);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(x));
      label.setAttribute('y', String(chartHeight + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
      label.textContent = String(tick);
      group.appendChild(label);
    });
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
    // Y-axis line
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', String(chartHeight));
    yAxis.setAttribute('stroke', colors.grid);
    yAxis.setAttribute('stroke-width', '1');
    group.appendChild(yAxis);

    // X-axis line
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', '0');
    xAxis.setAttribute('y1', String(chartHeight));
    xAxis.setAttribute('x2', String(chartWidth));
    xAxis.setAttribute('y2', String(chartHeight));
    xAxis.setAttribute('stroke', colors.grid);
    xAxis.setAttribute('stroke-width', '1');
    group.appendChild(xAxis);

    // X-axis labels and grid lines
    const xTicks = calculateNiceTicks(xMin, xMax, 5);
    const xScale = createLinearScale([xMin, xMax], [0, chartWidth]);

    xTicks.forEach((tick) => {
      const x = xScale(tick);

      // Grid line
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', String(x));
      gridLine.setAttribute('y1', '0');
      gridLine.setAttribute('x2', String(x));
      gridLine.setAttribute('y2', String(chartHeight));
      gridLine.setAttribute('stroke', colors.grid);
      gridLine.setAttribute('stroke-width', '1');
      gridLine.setAttribute('opacity', '0.3');
      group.appendChild(gridLine);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(x));
      label.setAttribute('y', String(chartHeight + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
      label.textContent = String(tick);
      group.appendChild(label);
    });

    // Y-axis labels
    const yScale = createBandScale(yValues, [0, chartHeight], 0.2);
    yValues.forEach((value) => {
      const y = yScale.scale(value) + yScale.bandwidth / 2;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(-CHART_DEFAULTS.AXIS_LABEL_OFFSET));
      label.setAttribute('y', String(y));
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
      label.textContent = value;
      group.appendChild(label);
    });
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract renderChart(): void;
}