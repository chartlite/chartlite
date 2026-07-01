/**
 * LineChart implementation
 */

import { BaseChart } from './BaseChart';
import type { LineChartConfig } from '../types';
import {
  createLinearScale,
  createBandScale,
  generateLinePath,
  getThemeColors,
  getAllXValues,
  getCombinedYRange,
} from '../utils';

export class LineChart extends BaseChart {
  protected config: LineChartConfig;

  constructor(container: HTMLElement | string, config: LineChartConfig) {
    super(container, config, config.data);

    this.config = {
      curve: 'linear',
      showPoints: true,
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

    // Get all unique x values and combined y range from all series
    const xValues = getAllXValues(this.seriesData).map(String);
    const { min: yMin, max: yMax } = getCombinedYRange(this.seriesData);

    // Set chart bounds for Phase 2 features (reference lines, annotations, regions)
    this.chartBounds = {
      xMin: 0,
      xMax: xValues.length - 1,
      yMin,
      yMax,
      xValues,
    };

    // Create scales
    const xScale = createBandScale(xValues, [0, chartWidth], 0);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    // Render axes using shared method
    this.renderCategoricalXLinearYAxes(mainGroup, xValues, yMin, yMax, chartWidth, chartHeight, colors);

    // Render each series
    this.seriesData.forEach((series) => {
      // Generate line path for this series
      const points = series.data.map((d) => ({
        x: xScale.scale(String(d.x)) + xScale.bandwidth / 2,
        y: yScale(d.y),
      }));

      const linePath = generateLinePath(points, this.config.curve);

      // Render line
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', linePath);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', series.color || colors.primary);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      mainGroup.appendChild(path);

      // Render points if enabled
      if (this.config.showPoints) {
        points.forEach((point, index) => {
          const dataPoint = series.data[index];
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', String(point.x));
          circle.setAttribute('cy', String(point.y));
          circle.setAttribute('r', '4');
          circle.setAttribute('fill', series.color || colors.primary);
          circle.setAttribute('stroke', colors.background);
          circle.setAttribute('stroke-width', '2');

          // ARIA attributes for accessibility
          circle.setAttribute('role', 'img');
          const seriesLabel = this.seriesData.length > 1 ? `${series.name}, ` : '';
          circle.setAttribute('aria-label', `${seriesLabel}Data point: ${dataPoint.x}, value ${dataPoint.y}`);
          circle.setAttribute('tabindex', '-1'); // Managed by keyboard navigation
          circle.classList.add('data-point');

          mainGroup.appendChild(circle);
        });
      }
    });
  }
}