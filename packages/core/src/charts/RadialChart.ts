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
import { getThemeColors } from '../utils';
import { setDataPointAttrs } from '../render/dataAttrs';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

export class RadialChart extends BaseChart {
  protected config: RadialChartConfig;

  constructor(container: HTMLElement | string, config: RadialChartConfig) {
    super(container, config, config.data);

    this.config = {
      max: 100,
      startAngle: 0,
      endAngle: 360,
      showValue: true,
      ...config,
    };
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = getThemeColors(this.config.theme || 'default');
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

    const cx = margin.left + chartWidth / 2;
    const cy = margin.top + chartHeight / 2;
    const outerRadius = (Math.min(chartWidth, chartHeight) / 2) * 0.92;

    // Ring geometry: outermost ring is the first data point.
    const ringCount = points.length;
    const thickness =
      this.config.thickness && this.config.thickness > 0
        ? this.config.thickness
        : Math.max(6, (outerRadius * (ringCount === 1 ? 0.28 : 0.6)) / ringCount);
    const gap = thickness * 0.4;

    const palette =
      this.config.colors && this.config.colors.length > 0
        ? this.config.colors
        : colors.seriesColors;
    const trackColor = this.config.trackColor || colors.grid;

    points.forEach((point, index) => {
      const outerR = outerRadius - index * (thickness + gap);
      const innerR = outerR - thickness;
      if (innerR <= 0) return; // ran out of room

      const fraction = Math.max(0, Math.min(1, point.y / max));
      const color = palette[index % palette.length];

      // Track (full sweep, faint)
      const track = document.createElementNS(SVG_NS, 'path');
      track.setAttribute('d', this.ringArc(cx, cy, outerR, innerR, a0, a1));
      track.setAttribute('fill', trackColor);
      track.setAttribute('opacity', '0.25');
      track.setAttribute('aria-hidden', 'true');
      mainGroup.appendChild(track);

      // Value arc
      if (fraction > 0) {
        const valueEnd = a0 + fraction * sweep;
        const arc = document.createElementNS(SVG_NS, 'path');
        arc.setAttribute('d', this.ringArc(cx, cy, outerR, innerR, a0, valueEnd));
        arc.setAttribute('fill', color);
        arc.setAttribute('role', 'img');
        const pct = Math.round(fraction * 100);
        arc.setAttribute('aria-label', `${point.label ?? point.x}: ${point.y} (${pct}%)`);
        arc.setAttribute('tabindex', '-1');
        arc.classList.add('data-point');
        setDataPointAttrs(arc, {
          x: point.label ?? point.x,
          y: point.y,
          seriesIndex: 0,
          index,
        });
        mainGroup.appendChild(arc);
      }
    });

    // Center value label (single ring only)
    if (this.config.showValue !== false && points.length === 1) {
      const value = points[0].y;
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', String(cx));
      text.setAttribute('y', String(cy));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', colors.text);
      text.setAttribute('font-size', String(Math.max(16, outerRadius * 0.32)));
      text.setAttribute('font-weight', '700');
      text.textContent = this.config.valueFormatter
        ? this.config.valueFormatter(value)
        : String(value);
      mainGroup.appendChild(text);
    }
  }

  /** Point on a circle at `angle` (0 = 12 o'clock, clockwise). */
  private polar(cx: number, cy: number, r: number, angle: number): [number, number] {
    return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];
  }

  /** Path for a donut-band arc from a0 to a1. Handles the full-circle case. */
  private ringArc(
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    a0: number,
    a1: number
  ): string {
    const arcSweep = a1 - a0;
    const isFull = arcSweep >= TAU - 1e-6;

    if (isFull) {
      const [ox0, oy0] = this.polar(cx, cy, outerR, 0);
      const [oxh, oyh] = this.polar(cx, cy, outerR, Math.PI);
      const [ix0, iy0] = this.polar(cx, cy, innerR, 0);
      const [ixh, iyh] = this.polar(cx, cy, innerR, Math.PI);
      return (
        `M ${ox0} ${oy0} A ${outerR} ${outerR} 0 1 1 ${oxh} ${oyh} ` +
        `A ${outerR} ${outerR} 0 1 1 ${ox0} ${oy0} Z ` +
        `M ${ix0} ${iy0} A ${innerR} ${innerR} 0 1 0 ${ixh} ${iyh} ` +
        `A ${innerR} ${innerR} 0 1 0 ${ix0} ${iy0} Z`
      );
    }

    const largeArc = arcSweep > Math.PI ? 1 : 0;
    const [ox0, oy0] = this.polar(cx, cy, outerR, a0);
    const [ox1, oy1] = this.polar(cx, cy, outerR, a1);
    const [ix1, iy1] = this.polar(cx, cy, innerR, a1);
    const [ix0, iy0] = this.polar(cx, cy, innerR, a0);
    return (
      `M ${ox0} ${oy0} A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox1} ${oy1} ` +
      `L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix0} ${iy0} Z`
    );
  }
}
