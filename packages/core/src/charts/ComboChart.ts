/**
 * ComboChart — mixes bar, line and area series on a single pair of axes.
 *
 * Each series carries its own render type (via the series-first data format,
 * e.g. `series: [{ name, dataKey, type: 'bar' }, { name, dataKey, type: 'line' }]`);
 * a series without a `type` falls back to `config.defaultType`. Bars are grouped
 * side-by-side among the bar series only, then areas and lines are drawn on top,
 * so the classic "bars + trend line" chart works out of the box. All series share
 * one linear y-axis and one categorical x-axis.
 */

import { BaseChart } from './BaseChart';
import type { ComboChartConfig, SeriesData } from '../types';
import {
  createLinearScale,
  createBandScale,
  generateLinePath,
  getThemeColors,
  getAllXValues,
  getCombinedYRange,
} from '../utils';
import { setDataPointAttrs, setSeriesAttrs } from '../render/dataAttrs';

const SVG_NS = 'http://www.w3.org/2000/svg';
type ThemeColors = ReturnType<typeof getThemeColors>;
type SeriesType = 'line' | 'bar' | 'area';

export class ComboChart extends BaseChart {
  protected config: ComboChartConfig;

  constructor(container: HTMLElement | string, config: ComboChartConfig) {
    super(container, config, config.data);

    this.config = {
      defaultType: 'bar',
      curve: 'linear',
      showPoints: true,
      fillOpacity: 0.25,
      ...config,
    };
  }

  /** The render type for a series: its own `type`, or the chart's `defaultType`. */
  private seriesType(series: SeriesData): SeriesType {
    return series.type || this.config.defaultType || 'bar';
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();
    const { margin } = this.dimensions;
    const chartWidth = this.dimensions.width - margin.left - margin.right;
    const chartHeight = this.dimensions.height - margin.top - margin.bottom;

    const mainGroup = this.createGroup(margin.left, margin.top);
    mainGroup.classList.add('chart-main');
    this.svg.appendChild(mainGroup);

    const xValues = getAllXValues(this.seriesData).map(String);
    const { min: yMin, max: yMax } = getCombinedYRange(this.seriesData);

    this.chartBounds = { xMin: 0, xMax: xValues.length - 1, yMin, yMax, xValues };

    // Bars sit inside a padded band; lines/areas plot at the band centre so they
    // align with the middle of each category's bar group.
    const xScale = createBandScale(xValues, [0, chartWidth], 0.2);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);
    // getCombinedYRange always includes 0, so the baseline is on-canvas.
    const baseline = yScale(0);

    this.renderCategoricalXLinearYAxes(
      mainGroup,
      xValues,
      yMin,
      yMax,
      chartWidth,
      chartHeight,
      colors
    );

    // Draw order: bars (back) → areas → lines + points (front).
    this.renderBarSeries(mainGroup, xScale, yScale, baseline, colors);
    this.seriesData.forEach((series, seriesIndex) => {
      const type = this.seriesType(series);
      if (type === 'area') {
        this.renderLineSeries(mainGroup, series, seriesIndex, xScale, yScale, baseline, colors, true);
      }
    });
    this.seriesData.forEach((series, seriesIndex) => {
      const type = this.seriesType(series);
      if (type === 'line') {
        this.renderLineSeries(mainGroup, series, seriesIndex, xScale, yScale, baseline, colors, false);
      }
    });
  }

  /** Render every bar-type series as side-by-side grouped bars. */
  private renderBarSeries(
    group: SVGGElement,
    xScale: { scale: (v: string) => number; bandwidth: number },
    yScale: (v: number) => number,
    baseline: number,
    colors: ThemeColors
  ): void {
    const barSeries = this.seriesData
      .map((series, seriesIndex) => ({ series, seriesIndex }))
      .filter(({ series }) => this.seriesType(series) === 'bar');

    const barCount = barSeries.length;
    if (barCount === 0) return;

    const groupPadding = 0.1;
    const slot = xScale.bandwidth / barCount;
    const drawnWidth = slot * (1 - groupPadding);

    barSeries.forEach(({ series, seriesIndex }, barPos) => {
      series.data.forEach((d, index) => {
        const groupX = xScale.scale(String(d.x));
        const barX = groupX + barPos * slot;
        const yVal = yScale(d.y);
        const top = Math.min(yVal, baseline);
        const height = Math.abs(baseline - yVal);

        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', String(barX));
        rect.setAttribute('y', String(top));
        rect.setAttribute('width', String(drawnWidth));
        rect.setAttribute('height', String(height));
        rect.setAttribute('fill', series.color || colors.primary);
        rect.setAttribute('rx', '4');
        rect.classList.add('bar');
        rect.classList.add('data-point');
        rect.setAttribute('role', 'img');
        const seriesLabel = this.seriesData.length > 1 ? `${series.name}, ` : '';
        rect.setAttribute('aria-label', `${seriesLabel}Bar: ${d.x}, value ${d.y}`);
        rect.setAttribute('tabindex', '-1');
        setDataPointAttrs(rect, {
          x: d.x,
          y: d.y,
          seriesName: series.name,
          seriesIndex,
          index,
          cx: barX + drawnWidth / 2,
          cy: top,
        });

        rect.style.transition = 'opacity 0.2s';
        this.addEventListenerTracked(rect, 'mouseenter', () => {
          rect.style.opacity = '0.8';
        });
        this.addEventListenerTracked(rect, 'mouseleave', () => {
          rect.style.opacity = '1';
        });

        group.appendChild(rect);
      });
    });
  }

  /** Render a single line or area series (line stroke, optional fill + points). */
  private renderLineSeries(
    group: SVGGElement,
    series: SeriesData,
    seriesIndex: number,
    xScale: { scale: (v: string) => number; bandwidth: number },
    yScale: (v: number) => number,
    baseline: number,
    colors: ThemeColors,
    isArea: boolean
  ): void {
    const color = series.color || colors.primary;
    const points = series.data.map((d) => ({
      x: xScale.scale(String(d.x)) + xScale.bandwidth / 2,
      y: yScale(d.y),
    }));
    if (points.length === 0) return;

    const linePath = generateLinePath(points, this.config.curve);

    if (isArea) {
      const first = points[0];
      const last = points[points.length - 1];
      const areaPath = `${linePath} L ${last.x},${baseline} L ${first.x},${baseline} Z`;
      const area = document.createElementNS(SVG_NS, 'path');
      area.setAttribute('d', areaPath);
      area.setAttribute('fill', color);
      area.setAttribute('opacity', String(this.config.fillOpacity));
      area.classList.add('area-fill');
      area.classList.add('data-series');
      area.setAttribute('role', 'presentation');
      area.setAttribute('aria-hidden', 'true');
      setSeriesAttrs(area, seriesIndex, series.name);
      group.appendChild(area);
    }

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', linePath);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.classList.add('combo-line');
    setSeriesAttrs(path, seriesIndex, series.name);
    group.appendChild(path);

    if (this.config.showPoints) {
      points.forEach((point, index) => {
        const d = series.data[index];
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', String(point.x));
        circle.setAttribute('cy', String(point.y));
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', colors.background);
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('role', 'img');
        const seriesLabel = this.seriesData.length > 1 ? `${series.name}, ` : '';
        circle.setAttribute('aria-label', `${seriesLabel}Data point: ${d.x}, value ${d.y}`);
        circle.setAttribute('tabindex', '-1');
        circle.classList.add('data-point');
        setDataPointAttrs(circle, {
          x: d.x,
          y: d.y,
          seriesName: series.name,
          seriesIndex,
          index,
          cx: point.x,
          cy: point.y,
        });
        group.appendChild(circle);
      });
    }
  }
}
