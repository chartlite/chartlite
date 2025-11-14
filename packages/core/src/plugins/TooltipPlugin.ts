/**
 * Tooltip Plugin
 *
 * Adds interactive tooltips to chart data points on hover.
 * Tree-shakeable - only included when explicitly imported and used.
 *
 * Usage:
 * ```typescript
 * import { LineChart } from '@chartlite/core';
 * import { TooltipPlugin } from '@chartlite/core/plugins';
 *
 * new LineChart('#chart', {
 *   data: [...],
 *   plugins: [new TooltipPlugin()]
 * }).render();
 * ```
 */

import type { ChartPlugin, PluginContext } from '../types';

export interface TooltipOptions {
  /** Whether to show tooltips (default: true) */
  enabled?: boolean;
  /** Custom tooltip formatter function */
  formatter?: (x: any, y: number, seriesName?: string) => string;
  /** Tooltip background color (default: rgba(0, 0, 0, 0.8)) */
  backgroundColor?: string;
  /** Tooltip text color (default: #ffffff) */
  textColor?: string;
  /** Tooltip padding in pixels (default: 8) */
  padding?: number;
  /** Tooltip border radius in pixels (default: 4) */
  borderRadius?: number;
  /** Tooltip font size in pixels (default: 12) */
  fontSize?: number;
}

export class TooltipPlugin implements ChartPlugin {
  name = 'tooltip';
  private options: Required<TooltipOptions>;
  private tooltip: HTMLDivElement | null = null;

  constructor(options: TooltipOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      formatter: options.formatter ?? ((x, y, seriesName) => {
        const label = seriesName ? `${seriesName}: ` : '';
        return `${label}${x}: ${y}`;
      }),
      backgroundColor: options.backgroundColor ?? 'rgba(0, 0, 0, 0.8)',
      textColor: options.textColor ?? '#ffffff',
      padding: options.padding ?? 8,
      borderRadius: options.borderRadius ?? 4,
      fontSize: options.fontSize ?? 12,
    };
  }

  afterRender(context: PluginContext): void {
    if (!this.options.enabled || !context.svg) return;

    // Create tooltip element if not exists
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.style.position = 'absolute';
      this.tooltip.style.display = 'none';
      this.tooltip.style.backgroundColor = this.options.backgroundColor;
      this.tooltip.style.color = this.options.textColor;
      this.tooltip.style.padding = `${this.options.padding}px`;
      this.tooltip.style.borderRadius = `${this.options.borderRadius}px`;
      this.tooltip.style.fontSize = `${this.options.fontSize}px`;
      this.tooltip.style.pointerEvents = 'none';
      this.tooltip.style.zIndex = '1000';
      this.tooltip.style.whiteSpace = 'nowrap';
      this.tooltip.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      document.body.appendChild(this.tooltip);
    }

    // Find all data point elements (circles, rects, etc.)
    const dataElements = context.svg.querySelectorAll('[data-x][data-y]');

    dataElements.forEach((element) => {
      const x = element.getAttribute('data-x');
      const y = element.getAttribute('data-y');
      const seriesName = element.getAttribute('data-series');

      if (!x || !y) return;

      element.addEventListener('mouseenter', (e: Event) => {
        if (!this.tooltip) return;

        const mouseEvent = e as MouseEvent;
        const yValue = parseFloat(y);
        const content = this.options.formatter(x, yValue, seriesName || undefined);

        this.tooltip.textContent = content;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${mouseEvent.pageX + 10}px`;
        this.tooltip.style.top = `${mouseEvent.pageY - 28}px`;
      });

      element.addEventListener('mousemove', (e: Event) => {
        if (!this.tooltip || this.tooltip.style.display === 'none') return;

        const mouseEvent = e as MouseEvent;
        this.tooltip.style.left = `${mouseEvent.pageX + 10}px`;
        this.tooltip.style.top = `${mouseEvent.pageY - 28}px`;
      });

      element.addEventListener('mouseleave', () => {
        if (!this.tooltip) return;
        this.tooltip.style.display = 'none';
      });
    });
  }

  beforeDestroy(): void {
    // Clean up tooltip element
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
      this.tooltip = null;
    }
  }
}
