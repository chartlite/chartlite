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
  calculateNiceTicks,
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

    // Create scales
    const xScale = createBandScale(xValues, [0, chartWidth], 0);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    // Render axes
    this.renderAxes(mainGroup, xValues, yMin, yMax, chartWidth, chartHeight, colors);

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
        points.forEach((point) => {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', String(point.x));
          circle.setAttribute('cy', String(point.y));
          circle.setAttribute('r', '4');
          circle.setAttribute('fill', series.color || colors.primary);
          circle.setAttribute('stroke', colors.background);
          circle.setAttribute('stroke-width', '2');
          mainGroup.appendChild(circle);
        });
      }
    });
  }

  private renderAxes(
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
      label.setAttribute('x', '-10');
      label.setAttribute('y', String(y));
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', '12');
      label.textContent = String(tick);
      group.appendChild(label);
    });

    // X-axis labels
    const xScale = createBandScale(xValues, [0, chartWidth], 0);
    xValues.forEach((value) => {
      const x = xScale.scale(value) + xScale.bandwidth / 2;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(x));
      label.setAttribute('y', String(chartHeight + 20));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', '12');
      label.textContent = value;
      group.appendChild(label);
    });
  }
}