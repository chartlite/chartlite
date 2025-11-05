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
} from '../types';
import {
  getDefaultDimensions,
  getThemeColors,
  isMultiSeriesData,
  normalizeToSeriesData,
  generateSeriesColors,
} from '../utils';

export abstract class BaseChart implements Chart {
  protected container: HTMLElement;
  protected config: BaseChartConfig;
  protected svg: SVGSVGElement | null = null;
  protected dimensions: Dimensions;
  protected data: DataPoint[]; // Legacy: for single-series backward compatibility
  protected seriesData: SeriesData[]; // New: normalized multi-series data
  protected isMultiSeries: boolean;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    container: HTMLElement | string,
    config: BaseChartConfig,
    dataInput: FlexibleDataInput
  ) {
    // Handle container selector or element
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(`Container not found: ${container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = container;
    }

    this.config = {
      animate: true,
      theme: 'default',
      showLegend: false,
      responsive: true,
      ...config,
    };

    // Detect if multi-series data
    this.isMultiSeries = isMultiSeriesData(dataInput);

    // Normalize data to both formats for backward compatibility
    this.seriesData = normalizeToSeriesData(dataInput);
    this.data = this.seriesData[0]?.data || [];

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

    // Set up dimensions
    const width = this.config.width || this.container.clientWidth || 600;
    const height = this.config.height || this.container.clientHeight || 400;
    this.dimensions = getDefaultDimensions(width, height);
  }

  /**
   * Create the SVG element
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

    return svg;
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
    // Clear existing content
    this.container.innerHTML = '';

    // Create SVG
    this.svg = this.createSVG();

    // Render chart-specific content
    this.renderChart();

    // Add title if provided
    if (this.config.title) {
      this.renderTitle();
    }

    // Add legend if enabled (only for multi-series charts)
    const showLegend = this.config.legend?.show ?? this.config.showLegend ?? false;
    if (showLegend && this.seriesData.length > 1) {
      this.renderLegend();
    }

    // Apply animation if enabled
    if (this.config.animate) {
      this.applyAnimation();
    }

    // Append to container
    this.container.appendChild(this.svg);

    // Set up resize observer if responsive
    if (this.config.responsive && typeof ResizeObserver !== 'undefined') {
      this.setupResizeObserver();
    }
  }

  /**
   * Set up resize observer for responsive charts
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

          // Update dimensions if changed
          if (newWidth !== this.dimensions.width || newHeight !== this.dimensions.height) {
            this.dimensions = getDefaultDimensions(newWidth, newHeight);
            // Re-render without animation to avoid janky resizing
            const originalAnimate = this.config.animate;
            this.config.animate = false;
            this.render();
            this.config.animate = originalAnimate;
          }
        }
      }
    });

    this.resizeObserver.observe(this.container);
  }

  /**
   * Render title
   */
  protected renderTitle(): void {
    if (!this.svg) return;

    const colors = getThemeColors(this.config.theme || 'default');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(this.dimensions.width / 2));
    text.setAttribute('y', '24');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', colors.text);
    text.setAttribute('font-size', '18');
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
    const layout = this.config.legend?.layout || (position === 'top' || position === 'bottom' ? 'horizontal' : 'vertical');

    // Create legend group
    const legendGroup = this.createGroup();
    legendGroup.classList.add('chart-legend');

    // Calculate legend item dimensions
    const itemSpacing = 20;
    const iconSize = 12;
    const iconMargin = 6;

    if (layout === 'horizontal') {
      // Horizontal layout
      let currentX = 0;

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
        label.setAttribute('font-size', '12');
        label.textContent = series.name;
        itemGroup.appendChild(label);

        legendGroup.appendChild(itemGroup);

        // Calculate width for next item
        const labelWidth = series.name.length * 7; // Rough estimate
        currentX += iconSize + iconMargin + labelWidth + itemSpacing;
      });

      // Position legend based on position config
      if (position === 'top') {
        legendGroup.setAttribute('transform', `translate(${this.dimensions.margin.left}, 10)`);
      } else if (position === 'bottom') {
        legendGroup.setAttribute('transform', `translate(${this.dimensions.margin.left}, ${this.dimensions.height - 20})`);
      }
    } else {
      // Vertical layout
      let currentY = 0;

      this.seriesData.forEach((series) => {
        const itemGroup = this.createGroup(0, currentY);

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
        label.setAttribute('font-size', '12');
        label.textContent = series.name;
        itemGroup.appendChild(label);

        legendGroup.appendChild(itemGroup);
        currentY += iconSize + 8;
      });

      // Position legend based on position config
      if (position === 'right') {
        legendGroup.setAttribute('transform', `translate(${this.dimensions.width - this.dimensions.margin.right + 10}, ${this.dimensions.margin.top})`);
      } else if (position === 'left') {
        legendGroup.setAttribute('transform', `translate(10, ${this.dimensions.margin.top})`);
      }
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

    this.render();
  }

  /**
   * Destroy the chart
   */
  public destroy(): void {
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
  }

  /**
   * Export as SVG string
   */
  public toSVG(): string {
    if (!this.svg) {
      this.render();
    }
    return this.svg?.outerHTML || '';
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  protected abstract renderChart(): void;
}