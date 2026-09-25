/**
 * ScatterChart implementation
 */

import { BaseChart } from './BaseChart';
import type { ScatterChartConfig } from '../types';
import { getAllXValues, getCombinedYRange } from '../utils';
import { markDataPoint } from '../render/dataAttrs';
import { round, sideAlign, svgEl } from '../render/constants';

export class ScatterChart extends BaseChart {
  declare protected config: ScatterChartConfig;

  constructor(container: HTMLElement | string, config: ScatterChartConfig) {
    super(
      container,
      {
        pointSize: 4,
        showLabels: false,
        labelOffset: 10,
        labelPosition: 'auto',
        pointShape: 'circle',
        ...config,
      },
      config.data,
      'Scatter'
    );
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();

    // Scatter plots need numeric x values on a linear scale.
    const numericXValues = getAllXValues(this.seriesData).map(Number);
    if (numericXValues.some((value) => !Number.isFinite(value))) {
      throw new Error('Scatter chart x values must be finite numbers');
    }
    const { min, max } = getCombinedYRange(this.seriesData);
    const plot = this.plot([Math.min(...numericXValues), Math.max(...numericXValues)], [min, max]);

    const size = this.config.pointSize || 4;
    const shape = this.config.pointShape;
    // Labels sit `labelOffset` px beyond the point's edge ('auto' = above).
    const position = this.config.labelPosition;
    const dx = position === 'left' ? -1 : position === 'right' ? 1 : 0;
    const dy = position === 'bottom' ? 1 : dx ? 0 : -1;
    const gap = size + (this.config.labelOffset || 10);

    this.seriesData.forEach((series, seriesIndex) => {
      series.data.forEach((d, index) => {
        const x = plot.x(d.x);
        const y = plot.y(d.y);
        const style = {
          fill: series.color || colors.primary,
          'fill-opacity': 0.85,
          stroke: colors.background,
          'stroke-width': 1,
        };
        const point = shape === 'square'
          ? svgEl('rect', { x: x - size, y: y - size, width: size * 2, height: size * 2, ...style }, plot.g)
          : shape === 'triangle'
            ? svgEl('polygon', {
              // Equilateral: apex 1.732 × size above the centre.
              points: `${round(x)},${round(y - size * 1.732)} ${round(x - size)},${round(y + size)} ${round(x + size)},${round(y + size)}`,
              ...style,
            }, plot.g)
            : svgEl('circle', { cx: x, cy: y, r: size, ...style }, plot.g);
        const seriesLabel = this.seriesData.length > 1 ? `${series.name}, ` : '';
        markDataPoint(
          point, `${seriesLabel}Point: x=${d.x}, y=${d.y}${d.label ? `, ${d.label}` : ''}`,
          d.x, d.y, series.name, seriesIndex, index, x, y
        );

        if (this.config.showLabels && d.label) {
          svgEl('text', {
            x: x + dx * gap,
            y: y + dy * gap,
            ...sideAlign(dx, dy),
            fill: colors.text,
            'font-size': 11,
            'font-weight': 500,
          }, plot.g).textContent = d.label;
        }
      });
    });
  }
}
