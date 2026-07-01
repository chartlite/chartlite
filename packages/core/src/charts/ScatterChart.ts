/**
 * ScatterChart implementation
 */

import { BaseChart } from './BaseChart';
import type { ScatterChartConfig } from '../types';
import {
  createLinearScale,
  getThemeColors,
  getAllXValues,
  getCombinedYRange,
} from '../utils';

export class ScatterChart extends BaseChart {
  protected config: ScatterChartConfig;

  constructor(container: HTMLElement | string, config: ScatterChartConfig) {
    super(container, config, config.data);

    this.config = {
      pointSize: 6,
      showLabels: false,
      labelOffset: 10,
      labelPosition: 'auto',
      pointShape: 'circle',
      ...config,
    };
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = getThemeColors(this.config.theme || 'default');
    const { margin } = this.dimensions;
    const chartWidth = this.dimensions.width - margin.left - margin.right;
    const chartHeight = this.dimensions.height - margin.top - margin.bottom;

    // Create main group
    const mainGroup = this.createGroup(margin.left, margin.top);
    mainGroup.classList.add('chart-main');
    this.svg.appendChild(mainGroup);

    // Get all x values and y range from all series
    const allXValues = getAllXValues(this.seriesData);
    const { min: yMin, max: yMax } = getCombinedYRange(this.seriesData);

    // Convert x values to numbers for scatter plot (we need numeric scales)
    const numericXValues = allXValues.map(v => typeof v === 'number' ? v : parseFloat(String(v)));
    const xMin = Math.min(...numericXValues);
    const xMax = Math.max(...numericXValues);

    // Set chart bounds for Phase 2 features (reference lines, annotations, regions)
    this.chartBounds = {
      xMin,
      xMax,
      yMin,
      yMax,
    };

    // Create linear scales for both axes (scatter plots need numeric x-axis)
    const xScale = createLinearScale([xMin, xMax], [0, chartWidth]);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    // Render axes using shared method
    this.renderLinearXLinearYAxes(mainGroup, xMin, xMax, yMin, yMax, chartWidth, chartHeight, colors);

    // Render each series
    this.seriesData.forEach((series) => {
      // Render points for this series
      series.data.forEach((d) => {
        const x = xScale(typeof d.x === 'number' ? d.x : parseFloat(String(d.x)));
        const y = yScale(d.y);

        // Render point with ARIA label
        const seriesLabel = this.seriesData.length > 1 ? `${series.name}, ` : '';
        const ariaLabel = `${seriesLabel}Point: x=${d.x}, y=${d.y}${d.label ? `, ${d.label}` : ''}`;
        this.renderPoint(mainGroup, x, y, series.color || colors.primary, colors, ariaLabel);

        // Render label if enabled and label exists
        if (this.config.showLabels && d.label) {
          this.renderLabel(mainGroup, x, y, d.label, colors);
        }
      });
    });
  }

  /**
   * Render a single point based on shape
   */
  private renderPoint(
    group: SVGGElement,
    x: number,
    y: number,
    color: string,
    colors: ReturnType<typeof getThemeColors>,
    ariaLabel: string
  ): void {
    const size = this.config.pointSize || 6;
    const shape = this.config.pointShape || 'circle';

    switch (shape) {
      case 'circle':
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(x));
        circle.setAttribute('cy', String(y));
        circle.setAttribute('r', String(size));
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', colors.background);
        circle.setAttribute('stroke-width', '2');
        circle.classList.add('data-point');

        // ARIA attributes for accessibility
        circle.setAttribute('role', 'img');
        circle.setAttribute('aria-label', ariaLabel);
        circle.setAttribute('tabindex', '-1');

        group.appendChild(circle);
        break;

      case 'square':
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(x - size));
        rect.setAttribute('y', String(y - size));
        rect.setAttribute('width', String(size * 2));
        rect.setAttribute('height', String(size * 2));
        rect.setAttribute('fill', color);
        rect.setAttribute('stroke', colors.background);
        rect.setAttribute('stroke-width', '2');
        rect.classList.add('data-point');

        // ARIA attributes for accessibility
        rect.setAttribute('role', 'img');
        rect.setAttribute('aria-label', ariaLabel);
        rect.setAttribute('tabindex', '-1');

        group.appendChild(rect);
        break;

      case 'triangle':
        const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const height = size * 1.732; // Equilateral triangle height
        const points = [
          `${x},${y - height}`,
          `${x - size},${y + size}`,
          `${x + size},${y + size}`
        ].join(' ');
        triangle.setAttribute('points', points);
        triangle.setAttribute('fill', color);
        triangle.setAttribute('stroke', colors.background);
        triangle.setAttribute('stroke-width', '2');
        triangle.classList.add('data-point');

        // ARIA attributes for accessibility
        triangle.setAttribute('role', 'img');
        triangle.setAttribute('aria-label', ariaLabel);
        triangle.setAttribute('tabindex', '-1');

        group.appendChild(triangle);
        break;
    }
  }

  /**
   * Render a label for a point
   */
  private renderLabel(
    group: SVGGElement,
    x: number,
    y: number,
    labelText: string,
    colors: ReturnType<typeof getThemeColors>
  ): void {
    const offset = this.config.labelOffset || 10;
    const position = this.config.labelPosition || 'auto';
    const size = this.config.pointSize || 6;

    // Calculate label position
    let labelX = x;
    let labelY = y;
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    let dominantBaseline: 'auto' | 'middle' | 'hanging' = 'auto';

    switch (position) {
      case 'top':
        labelY = y - size - offset;
        textAnchor = 'middle';
        dominantBaseline = 'auto';
        break;
      case 'bottom':
        labelY = y + size + offset;
        textAnchor = 'middle';
        dominantBaseline = 'hanging';
        break;
      case 'left':
        labelX = x - size - offset;
        labelY = y;
        textAnchor = 'end';
        dominantBaseline = 'middle';
        break;
      case 'right':
        labelX = x + size + offset;
        labelY = y;
        textAnchor = 'start';
        dominantBaseline = 'middle';
        break;
      case 'auto':
      default:
        // Default to top for auto
        labelY = y - size - offset;
        textAnchor = 'middle';
        dominantBaseline = 'auto';
        break;
    }

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(labelX));
    label.setAttribute('y', String(labelY));
    label.setAttribute('text-anchor', textAnchor);
    label.setAttribute('dominant-baseline', dominantBaseline);
    label.setAttribute('fill', colors.text);
    label.setAttribute('font-size', '11');
    label.setAttribute('font-weight', '500');
    label.textContent = labelText;

    group.appendChild(label);
  }
}
