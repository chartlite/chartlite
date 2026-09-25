/**
 * RadialChart — radial progress rings and gauges.
 *
 * Each data point is drawn as a concentric arc (a "radial bar") over a faint
 * track, filled in proportion to `max`. Great for KPIs and marketing stats.
 * Set `startAngle`/`endAngle` to make a gauge (e.g. a 180° sweep) instead of a
 * full ring. Each arc is a focusable `.data-point` with an ARIA label, matching
 * the accessibility of the other chart types.
 */

import { BaseChart } from './BaseChart';
import type { RadialChartConfig } from '../types';
import { markDataPoint } from '../render/dataAttrs';
import { arcPath, polar, svgEl } from '../render/constants';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

export class RadialChart extends BaseChart {
  declare protected config: RadialChartConfig;

  constructor(container: HTMLElement | string, config: RadialChartConfig) {
    super(container, { max: 100, startAngle: 0, endAngle: 360, showValue: true, ...config }, config.data, 'Radial');
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

    const points = this.data;
    if (points.length === 0) return;

    const max = this.config.max && this.config.max > 0
      ? this.config.max
      : Math.max(1, ...points.map((p) => p.y));

    const a0 = (this.config.startAngle ?? 0) * DEG;
    const a1 = (this.config.endAngle ?? 360) * DEG;
    const sweep = a1 - a0;

    // Fit the swept arc (plus its centre, where the value sits) to the plot
    // area, so a 180° gauge fills the canvas instead of a quarter of it.
    const angles = [a0, a1, 0];
    for (let k = Math.ceil(a0 / (Math.PI / 2)); k * (Math.PI / 2) <= a1; k++) angles.push(k * (Math.PI / 2));
    const xs = angles.map((a, i) => (i === 2 ? 0 : Math.sin(a)));
    const ys = angles.map((a, i) => (i === 2 ? 0 : -Math.cos(a)));
    const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const unit = Math.max(0, Math.min(chartWidth / (maxX - minX || 1), chartHeight / (maxY - minY || 1)));
    const cx = margin.left + (chartWidth - (maxX - minX) * unit) / 2 - minX * unit;
    const cy = margin.top + (chartHeight - (maxY - minY) * unit) / 2 - minY * unit;
    const outerRadius = unit * 0.95;
    const isGauge = sweep < TAU - 1e-6;

    // Ring geometry: outermost ring is the first data point.
    const ringCount = points.length;
    const thickness =
      this.config.thickness && this.config.thickness > 0
        ? this.config.thickness
        : Math.max(6, (outerRadius * (ringCount === 1 ? 0.22 : 0.6)) / ringCount);
    const gap = thickness * 0.4;

    const palette = this.palette();

    points.forEach((point, index) => {
      const outerR = outerRadius - index * (thickness + gap);
      const innerR = outerR - thickness;
      if (innerR <= 0) return; // ran out of room

      const fraction = Math.max(0, Math.min(1, point.y / max));
      const color = palette[index % palette.length];

      // Track (full sweep): a faint tint of the ring's own color by default.
      // `data-index` hides it with its ring under legendToggle().
      const track = svgEl('path', {
        d: arcPath(cx, cy, outerR, innerR, a0, a1, true),
        fill: this.config.trackColor || color,
        opacity: this.config.trackColor ? 0.25 : 0.15,
        'data-index': index,
      }, mainGroup);

      // Value arc (the track itself is the data mark when the value is 0).
      const dataMark = fraction > 0
        ? svgEl('path', { d: arcPath(cx, cy, outerR, innerR, a0, a0 + fraction * sweep, true), fill: color }, mainGroup)
        : track;
      if (dataMark !== track) track.setAttribute('aria-hidden', 'true');

      const [dataX, dataY] = polar(cx, cy, (outerR + innerR) / 2, a0 + (fraction * sweep) / 2);
      markDataPoint(dataMark, `${point.label ?? point.x}: ${point.y} (${Math.round(fraction * 100)}%)`, point.label ?? point.x, point.y, this.seriesData[0]?.name, 0, index, dataX, dataY);
    });

    // Center value label (single ring only). Full rings center it; gauges sit
    // it on the baseline of the arc.
    if (this.config.showValue !== false && points.length === 1) {
      const { y } = points[0];
      svgEl('text', {
        x: cx,
        y: isGauge ? cy - 4 : cy,
        'text-anchor': 'middle',
        'dominant-baseline': isGauge ? undefined : 'middle',
        fill: colors.text,
        'font-size': Math.max(16, outerRadius * 0.32),
        'font-weight': 700,
      }, mainGroup).textContent = this.config.valueFormatter ? this.config.valueFormatter(y) : String(y);
    }
  }
}
