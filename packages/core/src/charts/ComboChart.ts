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

import { BaseChart, type Plot } from './BaseChart';
import type { ComboChartConfig, SeriesData } from '../types';
import { getThemeColors, getAllXValues, getCombinedYRange } from '../utils';
import { setSeriesAttrs } from '../render/dataAttrs';
import { barSlots, drawBar } from '../render/bar';
import { svgEl } from '../render/constants';
import { AUTO_POINTS_LIMIT, drawLineSeries } from '../render/line';

type ThemeColors = ReturnType<typeof getThemeColors>;
type SeriesType = 'line' | 'bar' | 'area';

export class ComboChart extends BaseChart {
  declare protected config: ComboChartConfig;

  constructor(container: HTMLElement | string, config: ComboChartConfig) {
    super(container, { defaultType: 'bar', curve: 'linear', fillOpacity: 0.25, ...config }, config.data, 'Combo');
  }

  /** The render type for a series: its own `type`, or the chart's `defaultType`. */
  private seriesType(series: SeriesData): SeriesType {
    return series.type || this.config.defaultType || 'bar';
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();
    const xValues = getAllXValues(this.seriesData).map(String);
    const { min, max } = getCombinedYRange(this.seriesData);
    // Bars and areas need a zero baseline; a line-only combo doesn't.
    const zero = this.seriesData.some((series) => this.seriesType(series) !== 'line');
    // Bars sit inside a padded band; lines/areas plot at the band centre so they
    // align with the middle of each category's bar group.
    const plot = this.plot(xValues, [min, max], zero, 0.2);
    const baseline = plot.y(Math.max(this.chartBounds!.yMin, Math.min(0, this.chartBounds!.yMax)));

    // Draw order: bars (back) → areas → lines + points (front).
    this.renderBarSeries(plot, baseline, colors);
    for (const type of ['area', 'line']) {
      this.seriesData.forEach((series, seriesIndex) => {
        if (this.seriesType(series) === type) {
          this.renderLineSeries(plot, series, seriesIndex, baseline, colors, type === 'area');
        }
      });
    }
  }

  /** Render every bar-type series as side-by-side grouped bars. */
  private renderBarSeries(plot: Plot, baseline: number, colors: ThemeColors): void {
    const barSeries = this.seriesData
      .map((series, seriesIndex) => ({ series, seriesIndex }))
      .filter(({ series }) => this.seriesType(series) === 'bar');
    if (barSeries.length === 0) return;

    const { thickness, offset } = barSlots(plot.bw, barSeries.length);
    const multi = this.seriesData.length > 1;
    barSeries.forEach(({ series, seriesIndex }, slot) => {
      series.data.forEach((d, index) => {
        const y = plot.y(d.y);
        drawBar(plot.g, {
          x: plot.x(d.x) + offset(slot),
          y: Math.min(y, baseline),
          width: thickness,
          height: Math.abs(baseline - y),
        }, Math.min(3, thickness / 2), series.color || colors.primary, series, seriesIndex, index, d, multi);
      });
    });
  }

  /** Render a single line or area series (line stroke, optional fill + points). */
  private renderLineSeries(
    plot: Plot,
    series: SeriesData,
    seriesIndex: number,
    baseline: number,
    colors: ThemeColors,
    isArea: boolean
  ): void {
    if (series.data.length === 0) return;
    const color = series.color || colors.primary;
    const path = drawLineSeries(plot, series, seriesIndex, {
      color,
      background: colors.background,
      curve: this.config.curve,
      showPoints: this.config.showPoints ?? series.data.length <= AUTO_POINTS_LIMIT,
      multi: this.seriesData.length > 1,
    }, isArea ? (d, points) => {
      const area = svgEl('path', {
        d: `${d}L${points[points.length - 1].x},${Math.round(baseline)}L${points[0].x},${Math.round(baseline)}Z`,
        fill: color,
        opacity: this.config.fillOpacity,
        role: 'presentation',
        'aria-hidden': 'true',
      }, plot.g);
      area.classList.add('area-fill');
      area.classList.add('data-series');
      setSeriesAttrs(area, seriesIndex, series.name);
    } : undefined);
    path.classList.add('combo-line');
  }
}
