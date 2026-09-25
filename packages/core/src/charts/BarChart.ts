/**
 * BarChart implementation
 */

import { BaseChart } from './BaseChart';
import type { BarChartConfig } from '../types';
import { getAllXValues, getCombinedYRange } from '../utils';
import { barSlots, drawBar } from '../render/bar';

/** The value range the value axis must cover. */
interface ValueExtent {
  min: number;
  max: number;
}

export class BarChart extends BaseChart {
  declare protected config: BarChartConfig;

  constructor(container: HTMLElement | string, config: BarChartConfig) {
    super(container, { orientation: 'vertical', stacked: false, ...config }, config.data, 'Bar');
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();
    const horizontal = this.config.orientation === 'horizontal';
    const categories = getAllXValues(this.seriesData).map(String);
    const stacked = this.config.stacked === true && this.seriesData.length > 1;
    const extent = stacked ? this.stackedExtents() : getCombinedYRange(this.seriesData);

    // The value axis always includes zero; categories run along the other axis.
    const plot = horizontal
      ? this.plot([extent.min, extent.max], categories, true, 0.2)
      : this.plot(categories, [extent.min, extent.max], true, 0.2);
    const value = horizontal ? plot.x : plot.y;
    const zero = value(0);

    // Stacked bars fill the band; grouped bars share it, sitting side by side
    // with a small gap. Capped bars stay together, centred in the band.
    const { thickness, offset } = barSlots(plot.bw, stacked ? 1 : this.seriesData.length);
    const positive = new Map<string, number>();
    const negative = new Map<string, number>();

    this.seriesData.forEach((series, seriesIndex) => {
      series.data.forEach((d, index) => {
        const category = String(d.x);
        let start = 0;
        if (stacked) {
          const totals = d.y >= 0 ? positive : negative;
          start = totals.get(category) ?? 0;
          totals.set(category, start + d.y);
        }
        const a = stacked ? value(start) : zero;
        const b = value(start + d.y);
        const across = (horizontal ? plot.y(category) : plot.x(category)) + offset(stacked ? 0 : seriesIndex);
        const lo = Math.min(a, b);
        const length = Math.abs(a - b);
        drawBar(
          plot.g,
          horizontal
            ? { x: lo, y: across, width: length, height: thickness }
            : { x: across, y: lo, width: thickness, height: length },
          stacked ? 0 : Math.min(3, thickness / 2),
          series.color || colors.primary,
          series, seriesIndex, index, d, this.seriesData.length > 1
        );
      });
    });
  }

  /** Diverging positive/negative stack extents across all categories. */
  private stackedExtents(): ValueExtent {
    const positive = new Map<string, number>();
    const negative = new Map<string, number>();
    for (const series of this.seriesData) {
      for (const point of series.data) {
        const totals = point.y >= 0 ? positive : negative;
        const category = String(point.x);
        totals.set(category, (totals.get(category) ?? 0) + point.y);
      }
    }
    return { min: Math.min(0, ...negative.values()), max: Math.max(0, ...positive.values()) };
  }
}
