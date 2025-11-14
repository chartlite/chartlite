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
  getAllXValues,
} from '../utils';

export class AreaChart extends BaseChart {
  protected config: AreaChartConfig;

  constructor(container: HTMLElement | string, config: AreaChartConfig) {
    super(container, config, config.data);

    this.config = {
      curve: 'linear',
      fillOpacity: 0.3,
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

    // Get all unique x values
    const xValues = getAllXValues(this.seriesData).map(String);

    // For stacked areas, we need to calculate cumulative values
    const stackedData = this.calculateStackedData(xValues);

    // Find the max cumulative value for y-axis
    const yMax = Math.max(...stackedData.map(s => Math.max(...s.cumulativeData.map(d => d.y1))));
    const yMin = 0; // Stacked areas always start at 0

    // Set chart bounds for Phase 2 features
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

    // Render each series as a stacked area (in reverse order so first series is on top)
    stackedData.forEach((seriesStack) => {
      // Generate points for the top line
      const topPoints = seriesStack.cumulativeData.map((d) => ({
        x: xScale.scale(String(d.x)) + xScale.bandwidth / 2,
        y: yScale(d.y1),
      }));

      // Generate points for the bottom line (reversed)
      const bottomPoints = seriesStack.cumulativeData.map((d) => ({
        x: xScale.scale(String(d.x)) + xScale.bandwidth / 2,
        y: yScale(d.y0),
      })).reverse();

      // Create area path (fill)
      const areaPath = this.generateStackedAreaPath(topPoints, bottomPoints);
      const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', areaPath);
      area.setAttribute('fill', seriesStack.color || colors.primary);
      area.setAttribute('opacity', String(this.config.fillOpacity));
      area.classList.add('area-fill');
      area.classList.add('data-series');

      // ARIA attributes for the area series
      area.setAttribute('role', 'img');
      const dataPoints = seriesStack.cumulativeData.length;
      const seriesLabel = this.seriesData.length > 1 ? `${seriesStack.name}, ` : '';
      area.setAttribute('aria-label', `${seriesLabel}Area series with ${dataPoints} data points`);
      area.setAttribute('tabindex', '-1');

      mainGroup.appendChild(area);

      // Create line path (stroke) for top edge
      const linePath = generateLinePath(topPoints, this.config.curve);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', linePath);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', seriesStack.color || colors.primary);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('stroke-linejoin', 'round');
      line.classList.add('area-line');

      // ARIA attributes for the line
      line.setAttribute('role', 'presentation'); // Decorative - area already has semantics
      line.setAttribute('aria-hidden', 'true'); // Hide from screen readers (area is sufficient)

      mainGroup.appendChild(line);
    });
  }

  /**
   * Calculate stacked data for multi-series areas
   */
  private calculateStackedData(xValues: string[]): Array<{
    name: string;
    color?: string;
    cumulativeData: Array<{ x: string | number; y0: number; y1: number }>;
  }> {
    // Create a map of x -> cumulative values
    const cumulativeMap = new Map<string, number>();
    xValues.forEach(x => cumulativeMap.set(x, 0));

    return this.seriesData.map((series) => {
      const cumulativeData = xValues.map((xVal) => {
        // Find the data point for this x value
        const dataPoint = series.data.find(d => String(d.x) === xVal);
        const value = dataPoint?.y || 0;

        // Get the current cumulative value (y0 = bottom of this area)
        const y0 = cumulativeMap.get(xVal) || 0;
        // Calculate y1 (top of this area)
        const y1 = y0 + value;

        // Update cumulative value for next series
        cumulativeMap.set(xVal, y1);

        return { x: xVal, y0, y1 };
      });

      return {
        name: series.name,
        color: series.color,
        cumulativeData,
      };
    });
  }

  /**
   * Generate SVG path for stacked area
   */
  private generateStackedAreaPath(
    topPoints: Array<{ x: number; y: number }>,
    bottomPoints: Array<{ x: number; y: number }>
  ): string {
    if (topPoints.length === 0) return '';

    // Generate top edge path
    const topPath = generateLinePath(topPoints, this.config.curve);

    // Generate bottom edge path
    const bottomPath = generateLinePath(bottomPoints, this.config.curve);

    // Combine: top edge + bottom edge + close
    return `${topPath} ${bottomPath.replace('M', 'L')} Z`;
  }
}
