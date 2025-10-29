/**
 * BarChart implementation
 */

import { BaseChart } from './BaseChart';
import type { BarChartConfig } from '../types';
import {
  createLinearScale,
  createBandScale,
  getThemeColors,
  calculateNiceTicks,
  normalizeData,
  extractColorsFromSeriesData,
} from '../utils';

export class BarChart extends BaseChart {
  protected config: BarChartConfig;

  constructor(container: HTMLElement | string, config: BarChartConfig) {
    // Normalize data and extract colors if from series-first format
    const normalizedData = normalizeData(config.data);
    const extractedColors = extractColorsFromSeriesData(config.data);

    super(container, config, normalizedData);

    this.config = {
      orientation: 'vertical',
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

    if (this.config.orientation === 'vertical') {
      this.renderVerticalBars(mainGroup, chartWidth, chartHeight, colors);
    } else {
      this.renderHorizontalBars(mainGroup, chartWidth, chartHeight, colors);
    }
  }

  private renderVerticalBars(
    group: SVGGElement,
    chartWidth: number,
    chartHeight: number,
    colors: ReturnType<typeof getThemeColors>
  ): void {
    // Extract data
    const xValues = this.data.map((d) => String(d.x));
    const yValues = this.data.map((d) => d.y);
    const yMin = Math.min(...yValues, 0);
    const yMax = Math.max(...yValues);

    // Create scales
    const xScale = createBandScale(xValues, [0, chartWidth], 0.2);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    // Render axes and grid
    this.renderVerticalAxes(group, xValues, yMin, yMax, chartWidth, chartHeight, colors);

    // Render bars
    this.data.forEach((d, i) => {
      const x = xScale.scale(String(d.x));
      const barHeight = chartHeight - yScale(d.y);
      const y = yScale(d.y);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(x));
      rect.setAttribute('y', String(y));
      rect.setAttribute('width', String(xScale.bandwidth));
      rect.setAttribute('height', String(Math.abs(barHeight)));
      rect.setAttribute('fill', this.config.colors?.[i % (this.config.colors?.length || 1)] || colors.primary);
      rect.setAttribute('rx', '4'); // Rounded corners
      rect.classList.add('bar');

      // Add hover effect via CSS class
      rect.style.transition = 'opacity 0.2s';
      rect.addEventListener('mouseenter', () => {
        rect.style.opacity = '0.8';
      });
      rect.addEventListener('mouseleave', () => {
        rect.style.opacity = '1';
      });

      group.appendChild(rect);
    });
  }

  private renderHorizontalBars(
    group: SVGGElement,
    chartWidth: number,
    chartHeight: number,
    colors: ReturnType<typeof getThemeColors>
  ): void {
    // Extract data
    const yValues = this.data.map((d) => String(d.x));
    const xValues = this.data.map((d) => d.y);
    const xMin = Math.min(...xValues, 0);
    const xMax = Math.max(...xValues);

    // Create scales
    const yScale = createBandScale(yValues, [0, chartHeight], 0.2);
    const xScale = createLinearScale([xMin, xMax], [0, chartWidth]);

    // Render axes and grid
    this.renderHorizontalAxes(group, yValues, xMin, xMax, chartWidth, chartHeight, colors);

    // Render bars
    this.data.forEach((d, i) => {
      const y = yScale.scale(String(d.x));
      const barWidth = xScale(d.y);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', String(y));
      rect.setAttribute('width', String(Math.abs(barWidth)));
      rect.setAttribute('height', String(yScale.bandwidth));
      rect.setAttribute('fill', this.config.colors?.[i % (this.config.colors?.length || 1)] || colors.primary);
      rect.setAttribute('rx', '4'); // Rounded corners
      rect.classList.add('bar');

      // Add hover effect
      rect.style.transition = 'opacity 0.2s';
      rect.addEventListener('mouseenter', () => {
        rect.style.opacity = '0.8';
      });
      rect.addEventListener('mouseleave', () => {
        rect.style.opacity = '1';
      });

      group.appendChild(rect);
    });
  }

  private renderVerticalAxes(
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
    const xScale = createBandScale(xValues, [0, chartWidth], 0.2);
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

  private renderHorizontalAxes(
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
      label.setAttribute('y', String(chartHeight + 20));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', '12');
      label.textContent = String(tick);
      group.appendChild(label);
    });

    // Y-axis labels
    const yScale = createBandScale(yValues, [0, chartHeight], 0.2);
    yValues.forEach((value) => {
      const y = yScale.scale(value) + yScale.bandwidth / 2;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', '-10');
      label.setAttribute('y', String(y));
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', colors.text);
      label.setAttribute('font-size', '12');
      label.textContent = value;
      group.appendChild(label);
    });
  }

  protected renderLegend(): void {
    // Legend implementation can be added later
    // For now, bar charts typically don't need legends for single series
  }
}
