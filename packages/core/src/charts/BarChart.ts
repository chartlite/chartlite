/**
 * BarChart implementation
 */

import { BaseChart } from './BaseChart';
import type { BarChartConfig, DataPoint, SeriesData } from '../types';
import {
  createLinearScale,
  createBandScale,
  getThemeColors,
  getAllXValues,
  getCombinedYRange,
} from '../utils';
import { setDataPointAttrs } from '../render/dataAttrs';

type ThemeColors = ReturnType<typeof getThemeColors>;

export class BarChart extends BaseChart {
  protected config: BarChartConfig;

  constructor(container: HTMLElement | string, config: BarChartConfig) {
    super(container, config, config.data);

    this.config = {
      orientation: 'vertical',
      stacked: false,
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

  /** True when the chart should stack series rather than group them. */
  private get isStacked(): boolean {
    return this.config.stacked === true && this.seriesData.length > 1;
  }

  /** Per-category stacked total (sum of non-negative series values). */
  private stackedTotal(xValue: string): number {
    return this.seriesData.reduce((sum, series) => {
      const point = series.data.find((d) => String(d.x) === xValue);
      return sum + Math.max(0, point?.y ?? 0);
    }, 0);
  }

  /**
   * Append a single bar rectangle with accessibility attributes, the data-*
   * contract, and the hover effect. Shared by grouped/stacked and both orientations.
   */
  private appendBar(
    group: SVGGElement,
    rect: { x: number; y: number; width: number; height: number; rx: number },
    color: string,
    meta: {
      series: SeriesData;
      seriesIndex: number;
      index: number;
      d: DataPoint;
      cx: number;
      cy: number;
    }
  ): void {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    el.setAttribute('x', String(rect.x));
    el.setAttribute('y', String(rect.y));
    el.setAttribute('width', String(Math.abs(rect.width)));
    el.setAttribute('height', String(Math.abs(rect.height)));
    el.setAttribute('fill', color);
    el.setAttribute('rx', String(rect.rx));
    el.classList.add('bar');
    el.classList.add('data-point');

    // ARIA attributes for accessibility
    el.setAttribute('role', 'img');
    const seriesLabel = this.seriesData.length > 1 ? `${meta.series.name}, ` : '';
    el.setAttribute('aria-label', `${seriesLabel}Bar: ${meta.d.x}, value ${meta.d.y}`);
    el.setAttribute('tabindex', '-1'); // Managed by keyboard navigation
    setDataPointAttrs(el, {
      x: meta.d.x,
      y: meta.d.y,
      seriesName: meta.series.name,
      seriesIndex: meta.seriesIndex,
      index: meta.index,
      cx: meta.cx,
      cy: meta.cy,
    });

    // Add hover effect with tracked listeners
    el.style.transition = 'opacity 0.2s';
    this.addEventListenerTracked(el, 'mouseenter', () => {
      el.style.opacity = '0.8';
    });
    this.addEventListenerTracked(el, 'mouseleave', () => {
      el.style.opacity = '1';
    });

    group.appendChild(el);
  }

  private renderVerticalBars(
    group: SVGGElement,
    chartWidth: number,
    chartHeight: number,
    colors: ThemeColors
  ): void {
    const xValues = getAllXValues(this.seriesData).map(String);
    const stacked = this.isStacked;

    // Y range: stacked sums to per-category totals from 0; grouped uses the combined range.
    let yMin: number;
    let yMax: number;
    if (stacked) {
      yMin = 0;
      yMax = Math.max(1, ...xValues.map((x) => this.stackedTotal(x)));
    } else {
      const range = getCombinedYRange(this.seriesData);
      yMin = range.min;
      yMax = range.max;
    }

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

    const groupPadding = 0.1;

    if (stacked) {
      const drawnWidth = xScale.bandwidth * (1 - groupPadding);
      const cumulative = new Map<string, number>();
      xValues.forEach((x) => cumulative.set(x, 0));

      this.seriesData.forEach((series, seriesIndex) => {
        series.data.forEach((d, index) => {
          const xKey = String(d.x);
          const value = Math.max(0, d.y);
          const y0 = cumulative.get(xKey) ?? 0;
          const y1 = y0 + value;
          cumulative.set(xKey, y1);

          const barX = xScale.scale(xKey) + (xScale.bandwidth - drawnWidth) / 2;
          const yTop = yScale(y1);
          const segHeight = yScale(y0) - yScale(y1);

          this.appendBar(
            group,
            { x: barX, y: yTop, width: drawnWidth, height: segHeight, rx: 2 },
            series.color || colors.primary,
            { series, seriesIndex, index, d, cx: barX + drawnWidth / 2, cy: yTop }
          );
        });
      });
      return;
    }

    // Grouped bars (side-by-side)
    const seriesCount = this.seriesData.length;
    const barWidth = xScale.bandwidth / seriesCount;

    this.seriesData.forEach((series, seriesIndex) => {
      series.data.forEach((d, index) => {
        const groupX = xScale.scale(String(d.x));
        const barX = groupX + seriesIndex * barWidth;
        const y = yScale(d.y);
        const barHeight = chartHeight - y;
        const drawnWidth = barWidth * (1 - groupPadding);

        this.appendBar(
          group,
          { x: barX, y, width: drawnWidth, height: barHeight, rx: 4 },
          series.color || colors.primary,
          { series, seriesIndex, index, d, cx: barX + drawnWidth / 2, cy: y }
        );
      });
    });
  }

  private renderHorizontalBars(
    group: SVGGElement,
    chartWidth: number,
    chartHeight: number,
    colors: ThemeColors
  ): void {
    const yValues = getAllXValues(this.seriesData).map(String);
    const stacked = this.isStacked;

    let xMin: number;
    let xMax: number;
    if (stacked) {
      xMin = 0;
      xMax = Math.max(1, ...yValues.map((y) => this.stackedTotal(y)));
    } else {
      const range = getCombinedYRange(this.seriesData);
      xMin = range.min;
      xMax = range.max;
    }

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

    const groupPadding = 0.1;

    if (stacked) {
      const drawnHeight = yScale.bandwidth * (1 - groupPadding);
      const cumulative = new Map<string, number>();
      yValues.forEach((y) => cumulative.set(y, 0));

      this.seriesData.forEach((series, seriesIndex) => {
        series.data.forEach((d, index) => {
          const cat = String(d.x);
          const value = Math.max(0, d.y);
          const x0 = cumulative.get(cat) ?? 0;
          const x1 = x0 + value;
          cumulative.set(cat, x1);

          const barY = yScale.scale(cat) + (yScale.bandwidth - drawnHeight) / 2;
          const barX = xScale(x0);
          const segWidth = xScale(x1) - xScale(x0);

          this.appendBar(
            group,
            { x: barX, y: barY, width: segWidth, height: drawnHeight, rx: 2 },
            series.color || colors.primary,
            { series, seriesIndex, index, d, cx: barX + segWidth, cy: barY + drawnHeight / 2 }
          );
        });
      });
      return;
    }

    // Grouped bars
    const seriesCount = this.seriesData.length;
    const barHeight = yScale.bandwidth / seriesCount;

    this.seriesData.forEach((series, seriesIndex) => {
      series.data.forEach((d, index) => {
        const groupY = yScale.scale(String(d.x));
        const barY = groupY + seriesIndex * barHeight;
        const barWidth = xScale(d.y);
        const drawnHeight = barHeight * (1 - groupPadding);

        this.appendBar(
          group,
          { x: 0, y: barY, width: barWidth, height: drawnHeight, rx: 4 },
          series.color || colors.primary,
          { series, seriesIndex, index, d, cx: barWidth, cy: barY + drawnHeight / 2 }
        );
      });
    });
  }
}
