/**
 * Base chart class that all chart types extend
 */

import type { BaseChartConfig, Chart, Dimensions, DataPoint } from '../types';
import { getDefaultDimensions, getThemeColors } from '../utils';

export abstract class BaseChart implements Chart {
  protected container: HTMLElement;
  protected config: BaseChartConfig;
  protected svg: SVGSVGElement | null = null;
  protected dimensions: Dimensions;
  protected data: DataPoint[];
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement | string, config: BaseChartConfig, data: DataPoint[]) {
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

    this.data = data;

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

    // Add legend if enabled
    if (this.config.showLegend) {
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
  public update(data: DataPoint[]): void {
    this.data = data;
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
  protected abstract renderLegend(): void;
}