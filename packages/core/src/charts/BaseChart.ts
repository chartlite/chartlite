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

    // Set up dimensions with space for title and legend
    // Use container size as base, but we'll expand for title/legend
    const baseWidth = this.config.width || this.container.clientWidth || 600;
    const baseHeight = this.config.height || this.container.clientHeight || 400;
    this.dimensions = this.calculateDimensions(baseWidth, baseHeight);
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
      const titleFontSize = 18;
      const titlePadding = 10; // Space between title and chart
      extraTopSpace += titleFontSize + titlePadding;
    }

    // Legend adds space based on position
    const showLegend = this.config.legend?.show ?? this.config.showLegend ?? false;
    if (showLegend && this.seriesData.length > 1) {
      const legendFontSize = 12;
      const legendPadding = 15; // Space between legend and chart/title
      const legendHeight = legendFontSize + legendPadding;

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

    // Render chart-specific content FIRST
    // This must happen before title/legend so we know the data bounds
    this.renderChart();

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
            this.dimensions = this.calculateDimensions(newWidth, newHeight);
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
   * Render title - positioned at top of SVG, outside the data area
   */
  protected renderTitle(): void {
    if (!this.svg) return;

    const colors = getThemeColors(this.config.theme || 'default');
    const titleFontSize = 18;

    // Position title near the top of SVG
    // We have expanded the margin.top to include space for title
    // The base margin is 40, so position title at font size from top edge
    const titleY = titleFontSize + 5; // 5px padding from top

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(this.dimensions.width / 2));
    text.setAttribute('y', String(titleY));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', colors.text);
    text.setAttribute('font-size', String(titleFontSize));
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
    const itemSpacing = 20;
    const iconSize = 12;
    const iconMargin = 6;

    // Render horizontal legend (only layout supported)
    let currentX = 0;
    let totalWidth = 0;

    // First pass: calculate total width
    this.seriesData.forEach((series) => {
      const labelWidth = series.name.length * 7; // Rough estimate
      totalWidth += iconSize + iconMargin + labelWidth + itemSpacing;
    });
    totalWidth -= itemSpacing; // Remove trailing spacing

    // Second pass: render items
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
      const legendFontSize = 12;
      let legendY: number;

      if (this.config.title) {
        // Title is present - position legend below title
        const titleFontSize = 18;
        const titleY = titleFontSize + 5; // Title position
        const spacing = 10; // Space between title and legend
        legendY = titleY + spacing;
      } else {
        // No title - position legend near top of SVG
        legendY = legendFontSize + 5; // 5px padding from top
      }

      legendGroup.setAttribute('transform', `translate(${legendX}, ${legendY})`);
    } else {
      // Position legend in the bottom margin area
      const baseDims = getDefaultDimensions(this.dimensions.width, 400);
      const dataAreaBottom = this.dimensions.height - this.dimensions.margin.bottom + baseDims.margin.bottom;
      const legendFontSize = 12;
      const legendY = dataAreaBottom + legendFontSize; // Position just below data area
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