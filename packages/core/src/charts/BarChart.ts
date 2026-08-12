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
import { createSVGElement } from '../render/constants';

type ThemeColors = ReturnType<typeof getThemeColors>;

export class BarChart extends BaseChart {
  protected config: BarChartConfig;

  constructor(container: HTMLElement | string, config: BarChartConfig) {
    super(container, config, config.data, 'Bar');

    this.config = {
      orientation: 'vertical',
      stacked: false,
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

  /** Diverging positive/negative stack extents for each category. */
  private stackedExtents(categories: string[]): { min: number; max: number } {
    const positive = new Map(categories.map((category) => [category, 0]));
    const negative = new Map(categories.map((category) => [category, 0]));

    for (const series of this.seriesData) {
      for (const point of series.data) {
        const category = String(point.x);
        const totals = point.y >= 0 ? positive : negative;
        totals.set(category, (totals.get(category) ?? 0) + point.y);
      }
    }

    let min = 0;
    let max = 0;
    for (const value of negative.values()) min = Math.min(min, value);
    for (const value of positive.values()) max = Math.max(max, value);
    return min === max ? { min, max: min + 1 } : { min, max };
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
    }
  ): void {
    const el = createSVGElement('rect');
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
    setDataPointAttrs(
      el, meta.d.x, meta.d.y, meta.series.name, meta.seriesIndex, meta.index,
      rect.x + rect.width / 2, rect.y + rect.height / 2
    );

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

    // Bars always include zero; stacked bars use diverging positive/negative totals.
    let yMin: number;
    let yMax: number;
    if (stacked) {
      ({ min: yMin, max: yMax } = this.stackedExtents(xValues));
    } else {
      const range = getCombinedYRange(this.seriesData);
      yMin = Math.min(0, range.min);
      yMax = Math.max(0, range.max);
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
      const positive = new Map(xValues.map((x) => [x, 0]));
      const negative = new Map(xValues.map((x) => [x, 0]));

      this.seriesData.forEach((series, seriesIndex) => {
        series.data.forEach((d, index) => {
          const xKey = String(d.x);
          const cumulative = d.y >= 0 ? positive : negative;
          const y0 = cumulative.get(xKey) ?? 0;
          const y1 = y0 + d.y;
          cumulative.set(xKey, y1);

          const barX = xScale.scale(xKey) + (xScale.bandwidth - drawnWidth) / 2;
          const y0Pixel = yScale(y0);
          const y1Pixel = yScale(y1);
          const yTop = Math.min(y0Pixel, y1Pixel);
          const segHeight = Math.abs(y0Pixel - y1Pixel);

          this.appendBar(
            group,
            { x: barX, y: yTop, width: drawnWidth, height: segHeight, rx: 2 },
            series.color || colors.primary,
            { series, seriesIndex, index, d }
          );
        });
      });
      return;
    }

    // Grouped bars (side-by-side)
    const seriesCount = this.seriesData.length;
    const barWidth = xScale.bandwidth / seriesCount;

    const zeroY = yScale(0);
    this.seriesData.forEach((series, seriesIndex) => {
      series.data.forEach((d, index) => {
        const groupX = xScale.scale(String(d.x));
        const barX = groupX + seriesIndex * barWidth;
        const valueY = yScale(d.y);
        const y = Math.min(valueY, zeroY);
        const barHeight = Math.abs(zeroY - valueY);
        const drawnWidth = barWidth * (1 - groupPadding);

        this.appendBar(
          group,
          { x: barX, y, width: drawnWidth, height: barHeight, rx: 4 },
          series.color || colors.primary,
          { series, seriesIndex, index, d }
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
      ({ min: xMin, max: xMax } = this.stackedExtents(yValues));
    } else {
      const range = getCombinedYRange(this.seriesData);
      xMin = Math.min(0, range.min);
      xMax = Math.max(0, range.max);
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
      const positive = new Map(yValues.map((y) => [y, 0]));
      const negative = new Map(yValues.map((y) => [y, 0]));

      this.seriesData.forEach((series, seriesIndex) => {
        series.data.forEach((d, index) => {
          const cat = String(d.x);
          const cumulative = d.y >= 0 ? positive : negative;
          const x0 = cumulative.get(cat) ?? 0;
          const x1 = x0 + d.y;
          cumulative.set(cat, x1);

          const barY = yScale.scale(cat) + (yScale.bandwidth - drawnHeight) / 2;
          const x0Pixel = xScale(x0);
          const x1Pixel = xScale(x1);
          const barX = Math.min(x0Pixel, x1Pixel);
          const segWidth = Math.abs(x1Pixel - x0Pixel);

          this.appendBar(
            group,
            { x: barX, y: barY, width: segWidth, height: drawnHeight, rx: 2 },
            series.color || colors.primary,
            { series, seriesIndex, index, d }
          );
        });
      });
      return;
    }

    // Grouped bars
    const seriesCount = this.seriesData.length;
    const barHeight = yScale.bandwidth / seriesCount;

    const zeroX = xScale(0);
    this.seriesData.forEach((series, seriesIndex) => {
      series.data.forEach((d, index) => {
        const groupY = yScale.scale(String(d.x));
        const barY = groupY + seriesIndex * barHeight;
        const valueX = xScale(d.y);
        const barX = Math.min(valueX, zeroX);
        const barWidth = Math.abs(zeroX - valueX);
        const drawnHeight = barHeight * (1 - groupPadding);

        this.appendBar(
          group,
          { x: barX, y: barY, width: barWidth, height: drawnHeight, rx: 4 },
          series.color || colors.primary,
          { series, seriesIndex, index, d }
        );
      });
    });
  }
}
