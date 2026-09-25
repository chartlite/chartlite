/**
 * PieChart implementation (pie and donut).
 *
 * Renders a single series of values as angular slices. Each slice is a focusable
 * `.data-point` with an ARIA label, so keyboard navigation and screen-reader
 * support work the same as the cartesian charts.
 */

import { BaseChart } from './BaseChart';
import type { PieChartConfig } from '../types';
import { markDataPoint } from '../render/dataAttrs';
import { arcPath, svgEl } from '../render/constants';
import { getThemeColors } from '../utils';

const FULL_CIRCLE = Math.PI * 2;

export class PieChart extends BaseChart {
  declare protected config: PieChartConfig;

  constructor(container: HTMLElement | string, config: PieChartConfig) {
    super(container, { innerRadius: 0, showLabels: false, ...config }, config.data, 'Pie');
  }

  protected hasAxes(): boolean {
    return false;
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();
    const { margin } = this.dimensions;
    const chartWidth = this.dimensions.width - margin.left - margin.right;
    const chartHeight = this.dimensions.height - margin.top - margin.bottom;

    const mainGroup = this.createGroup();
    mainGroup.classList.add('chart-main');
    this.svg.appendChild(mainGroup);

    const slices = this.data;
    const total = slices.reduce((sum, d) => sum + Math.max(0, d.y), 0);
    if (total <= 0) return;

    // Center the pie in the available area; radius leaves room for the margins.
    const cx = margin.left + chartWidth / 2;
    const cy = margin.top + chartHeight / 2;
    const radius = Math.max(0, Math.min(chartWidth, chartHeight) / 2);
    const innerRadius =
      Math.max(0, Math.min(0.95, this.config.innerRadius ?? 0)) * radius;

    const palette = this.palette();

    let angleStart = 0;

    slices.forEach((slice, index) => {
      const value = Math.max(0, slice.y);
      if (value === 0) return; // skip zero-value slices (nothing to draw)

      const fraction = value / total;
      const angleEnd = angleStart + fraction * FULL_CIRCLE;
      const percent = (fraction * 100).toFixed(1);
      const midAngle = (angleStart + angleEnd) / 2;
      const dataRadius = innerRadius > 0 ? (radius + innerRadius) / 2 : radius * 0.65;
      const dataX = cx + dataRadius * Math.sin(midAngle);
      const dataY = cy - dataRadius * Math.cos(midAngle);

      const path = svgEl('path', {
        d: arcPath(cx, cy, radius, innerRadius, angleStart, angleEnd),
        fill: palette[index % palette.length],
        stroke: colors.background,
        'stroke-width': 2,
      }, mainGroup);
      markDataPoint(
        path, `${slice.label ?? slice.x}: ${slice.y} (${percent}%)`,
        slice.label ?? slice.x, slice.y, this.seriesData[0]?.name, 0, index, dataX, dataY
      );

      // Optional percentage label at the slice mid-angle, only where it fits:
      // the slice's chord at the label radius must clear "NN.N%" (~7px/char).
      // `data-index` hides it with its slice under legendToggle().
      const chord = 2 * dataRadius * Math.sin(Math.min(fraction, 0.5) * Math.PI);
      if (this.config.showLabels && chord >= (percent.length + 2) * 7 && radius - innerRadius >= 16) {
        svgEl('text', {
          x: dataX,
          y: dataY,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          // The raw theme background, not `var(--cl-bg)`: labels sit on the
          // slice colour, so they must stay visible when --cl-bg is transparent.
          fill: getThemeColors(this.config.theme || 'default').background,
          'font-size': 12,
          'font-weight': 600,
          'data-index': index,
        }, mainGroup).textContent = `${percent}%`;
      }

      angleStart = angleEnd;
    });
  }
}
