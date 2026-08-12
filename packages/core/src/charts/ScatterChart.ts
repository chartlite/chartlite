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
import { setDataPointAttrs } from '../render/dataAttrs';
import { createSVGElement } from '../render/constants';

export class ScatterChart extends BaseChart {
  protected config: ScatterChartConfig;

  constructor(container: HTMLElement | string, config: ScatterChartConfig) {
    super(container, config, config.data, 'Scatter');

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

    const colors = this.themeColors();
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
    const numericXValues = allXValues.map(Number);
    if (numericXValues.some((value) => !Number.isFinite(value))) {
      throw new Error('Scatter chart x values must be finite numbers');
    }
    let xMin = Math.min(...numericXValues);
    let xMax = Math.max(...numericXValues);
    if (xMin === xMax) {
      const padding = Math.abs(xMin) * 0.01 || 1;
      xMin -= padding;
      xMax += padding;
    }

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
    this.seriesData.forEach((series, seriesIndex) => {
      // Render points for this series
      series.data.forEach((d, index) => {
        const x = xScale(Number(d.x));
        const y = yScale(d.y);

        // Render point with ARIA label
        const seriesLabel = this.seriesData.length > 1 ? `${series.name}, ` : '';
        const ariaLabel = `${seriesLabel}Point: x=${d.x}, y=${d.y}${d.label ? `, ${d.label}` : ''}`;
        this.renderPoint(
          mainGroup, x, y, series.color || colors.primary, colors.background, ariaLabel,
          d.x, d.y, series.name, seriesIndex, index
        );

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
    background: string,
    ariaLabel: string,
    dataX: string | number,
    dataY: number,
    seriesName: string,
    seriesIndex: number,
    index: number
  ): void {
    const size = this.config.pointSize || 6;
    const shape = this.config.pointShape || 'circle';
    let element: SVGElement;

    switch (shape) {
      case 'circle':
        const circle = createSVGElement('circle');
        circle.setAttribute('cx', String(x));
        circle.setAttribute('cy', String(y));
        circle.setAttribute('r', String(size));
        element = circle;
        break;

      case 'square':
        const rect = createSVGElement('rect');
        rect.setAttribute('x', String(x - size));
        rect.setAttribute('y', String(y - size));
        rect.setAttribute('width', String(size * 2));
        rect.setAttribute('height', String(size * 2));
        element = rect;
        break;

      case 'triangle':
        const triangle = createSVGElement('polygon');
        const height = size * 1.732; // Equilateral triangle height
        const points = [
          `${x},${y - height}`,
          `${x - size},${y + size}`,
          `${x + size},${y + size}`
        ].join(' ');
        triangle.setAttribute('points', points);
        element = triangle;
        break;
    }

    element.setAttribute('fill', color);
    element.setAttribute('stroke', background);
    element.setAttribute('stroke-width', '2');
    element.classList.add('data-point');
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', ariaLabel);
    element.setAttribute('tabindex', '-1');
    setDataPointAttrs(element, dataX, dataY, seriesName, seriesIndex, index, x, y);
    group.appendChild(element);
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

    const label = createSVGElement('text');
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
