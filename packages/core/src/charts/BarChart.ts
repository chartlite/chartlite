/**
 * BarChart implementation
 */

import { BaseChart } from './BaseChart';
import type { BarChartConfig } from '../types';
import {
  createLinearScale,
  createBandScale,
  getThemeColors,
  getAllXValues,
  getCombinedYRange,
} from '../utils';

export class BarChart extends BaseChart {
  protected config: BarChartConfig;

  constructor(container: HTMLElement | string, config: BarChartConfig) {
    super(container, config, config.data);

    this.config = {
      orientation: 'vertical',
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
    // Get all unique x values and combined y range
    const xValues = getAllXValues(this.seriesData).map(String);
    const { min: yMin, max: yMax } = getCombinedYRange(this.seriesData);

    // Set chart bounds for Phase 2 features
    this.chartBounds = {
      xMin: 0,
      xMax: xValues.length - 1,
      yMin,
      yMax,
      xValues,
    };

    // Create scales
    const xScale = createBandScale(xValues, [0, chartWidth], 0.2);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    // Render axes using shared method
    this.renderCategoricalXLinearYAxes(group, xValues, yMin, yMax, chartWidth, chartHeight, colors);

    const seriesCount = this.seriesData.length;
    const groupPadding = 0.1; // Padding between bar groups
    const barWidth = xScale.bandwidth / seriesCount;

    // Render bars for each series
    this.seriesData.forEach((series, seriesIndex) => {
      series.data.forEach((d) => {
        const groupX = xScale.scale(String(d.x));
        const barX = groupX + seriesIndex * barWidth;
        const barHeight = chartHeight - yScale(d.y);
        const y = yScale(d.y);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(barX));
        rect.setAttribute('y', String(y));
        rect.setAttribute('width', String(barWidth * (1 - groupPadding)));
        rect.setAttribute('height', String(Math.abs(barHeight)));
        rect.setAttribute('fill', series.color || colors.primary);
        rect.setAttribute('rx', '4'); // Rounded corners
        rect.classList.add('bar');
        rect.classList.add('data-point');

        // ARIA attributes for accessibility
        rect.setAttribute('role', 'img');
        const seriesLabel = this.seriesData.length > 1 ? `${series.name}, ` : '';
        rect.setAttribute('aria-label', `${seriesLabel}Bar: ${d.x}, value ${d.y}`);
        rect.setAttribute('tabindex', '-1'); // Managed by keyboard navigation

        // Add hover effect with tracked listeners
        rect.style.transition = 'opacity 0.2s';
        const handleMouseEnter = () => {
          rect.style.opacity = '0.8';
        };
        const handleMouseLeave = () => {
          rect.style.opacity = '1';
        };
        this.addEventListenerTracked(rect, 'mouseenter', handleMouseEnter);
        this.addEventListenerTracked(rect, 'mouseleave', handleMouseLeave);

        group.appendChild(rect);
      });
    });
  }

  private renderHorizontalBars(
    group: SVGGElement,
    chartWidth: number,
    chartHeight: number,
    colors: ReturnType<typeof getThemeColors>
  ): void {
    // Get all unique y values (categories) and combined x range
    const yValues = getAllXValues(this.seriesData).map(String);
    const { min: xMin, max: xMax } = getCombinedYRange(this.seriesData);

    this.chartBounds = {
      xMin,
      xMax,
      yMin: 0,
      yMax: yValues.length - 1,
      xValues: yValues,
    };

    // Create scales
    const yScale = createBandScale(yValues, [0, chartHeight], 0.2);
    const xScale = createLinearScale([xMin, xMax], [0, chartWidth]);

    // Render axes using shared method
    this.renderLinearXCategoricalYAxes(group, yValues, xMin, xMax, chartWidth, chartHeight, colors);

    const seriesCount = this.seriesData.length;
    const groupPadding = 0.1;
    const barHeight = yScale.bandwidth / seriesCount;

    // Render bars for each series
    this.seriesData.forEach((series, seriesIndex) => {
      series.data.forEach((d) => {
        const groupY = yScale.scale(String(d.x));
        const barY = groupY + seriesIndex * barHeight;
        const barWidth = xScale(d.y);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', String(barY));
        rect.setAttribute('width', String(Math.abs(barWidth)));
        rect.setAttribute('height', String(barHeight * (1 - groupPadding)));
        rect.setAttribute('fill', series.color || colors.primary);
        rect.setAttribute('rx', '4'); // Rounded corners
        rect.classList.add('bar');
        rect.classList.add('data-point');

        // ARIA attributes for accessibility
        rect.setAttribute('role', 'img');
        const seriesLabel = this.seriesData.length > 1 ? `${series.name}, ` : '';
        rect.setAttribute('aria-label', `${seriesLabel}Bar: ${d.x}, value ${d.y}`);
        rect.setAttribute('tabindex', '-1'); // Managed by keyboard navigation

        // Add hover effect with tracked listeners
        rect.style.transition = 'opacity 0.2s';
        const handleMouseEnter = () => {
          rect.style.opacity = '0.8';
        };
        const handleMouseLeave = () => {
          rect.style.opacity = '1';
        };
        this.addEventListenerTracked(rect, 'mouseenter', handleMouseEnter);
        this.addEventListenerTracked(rect, 'mouseleave', handleMouseLeave);

        group.appendChild(rect);
      });
    });
  }
}
