/**
 * AreaChart implementation
 */

import { BaseChart } from './BaseChart';
import type { AreaChartConfig } from '../types';
import {
  createLinearScale,
  createBandScale,
  generateLinePath,
  getThemeColors,
  calculateNiceTicks,
  normalizeData,
  extractColorsFromSeriesData,
} from '../utils';

export class AreaChart extends BaseChart {
  protected config: AreaChartConfig;

  constructor(container: HTMLElement | string, config: AreaChartConfig) {
    // Normalize data and extract colors if from series-first format
    const normalizedData = normalizeData(config.data);
    const extractedColors = extractColorsFromSeriesData(config.data);

    super(container, config, normalizedData);

    this.config = {
      curve: 'linear',
      fillOpacity: 0.3,
      ...config,
      // Use extracted colors if available and not overridden
      colors: config.colors || extractedColors,
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

    // Extract data
    const xValues = this.data.map((d) => String(d.x));
    const yValues = this.data.map((d) => d.y);
    const yMin = Math.min(...yValues, 0);
    const yMax = Math.max(...yValues);

    // Create scales
    const xScale = createBandScale(xValues, [0, chartWidth], 0);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    // Render axes
    this.renderAxes(mainGroup, xValues, yMin, yMax, chartWidth, chartHeight, colors);

    // Generate line path points
    const points = this.data.map((d) => ({
      x: xScale.scale(String(d.x)) + xScale.bandwidth / 2,
      y: yScale(d.y),
    }));

    // Create area path (fill)
    const areaPath = this.generateAreaPath(points, chartHeight);
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaPath);
    area.setAttribute('fill', this.config.colors?.[0] || colors.primary);
    area.setAttribute('opacity', String(this.config.fillOpacity));
    area.classList.add('area-fill');
    mainGroup.appendChild(area);

    // Create line path (stroke)
    const linePath = generateLinePath(points, this.config.curve);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', linePath);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', this.config.colors?.[0] || colors.primary);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    line.classList.add('area-line');
    mainGroup.appendChild(line);
  }

  /**
   * Generate SVG path for area fill
   */
  private generateAreaPath(
    points: Array<{ x: number; y: number }>,
    chartHeight: number
  ): string {
    if (points.length === 0) return '';

    const linePath = generateLinePath(points, this.config.curve);

    // Start from bottom left
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    // Create closed path: line -> bottom right -> bottom left -> close
    return `${linePath} L ${lastPoint.x},${chartHeight} L ${firstPoint.x},${chartHeight} Z`;
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

  protected renderLegend(): void {
    // Legend implementation can be added later
  }
}
