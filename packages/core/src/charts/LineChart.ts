/**
 * LineChart implementation
 */

import { BaseChart } from './BaseChart';
import type { LineChartConfig } from '../types';
import { getAllXValues, getCombinedYRange } from '../utils';
import { AUTO_POINTS_LIMIT, drawLineSeries } from '../render/line';

export class LineChart extends BaseChart {
  declare protected config: LineChartConfig;

  constructor(container: HTMLElement | string, config: LineChartConfig) {
    super(container, { curve: 'linear', ...config }, config.data, 'Line');
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();
    const xValues = getAllXValues(this.seriesData).map(String);
    const { min, max } = getCombinedYRange(this.seriesData);
    const plot = this.plot(xValues, [min, max]);
    const multi = this.seriesData.length > 1;
    const showPoints = this.config.showPoints ??
      this.seriesData.every((series) => series.data.length <= AUTO_POINTS_LIMIT);

    this.seriesData.forEach((series, seriesIndex) => {
      drawLineSeries(plot, series, seriesIndex, {
        color: series.color || colors.primary,
        background: colors.background,
        curve: this.config.curve,
        showPoints,
        multi,
      });
    });
  }
}
