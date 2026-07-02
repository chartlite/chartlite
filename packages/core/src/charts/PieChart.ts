/**
 * PieChart implementation (pie and donut).
 *
 * Renders a single series of values as angular slices. Each slice is a focusable
 * `.data-point` with an ARIA label, so keyboard navigation and screen-reader
 * support work the same as the cartesian charts.
 */

import { BaseChart } from './BaseChart';
import type { PieChartConfig } from '../types';
import { getThemeColors } from '../utils';
import { setDataPointAttrs } from '../render/dataAttrs';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FULL_CIRCLE = Math.PI * 2;

export class PieChart extends BaseChart {
  protected config: PieChartConfig;

  constructor(container: HTMLElement | string, config: PieChartConfig) {
    super(container, config, config.data);

    this.config = {
      innerRadius: 0,
      showLabels: false,
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

    const slices = this.data;
    const total = slices.reduce((sum, d) => sum + Math.max(0, d.y), 0);
    if (total <= 0) return;

    // Center the pie in the available area; radius leaves room for the margins.
    const cx = this.dimensions.width / 2;
    const cy = margin.top + chartHeight / 2;
    const radius = Math.min(chartWidth, chartHeight) / 2;
    const innerRadius =
      Math.max(0, Math.min(0.95, this.config.innerRadius ?? 0)) * radius;

    const palette =
      this.config.colors && this.config.colors.length > 0
        ? this.config.colors
        : colors.seriesColors;

    let angleStart = 0;

    slices.forEach((slice, index) => {
      const value = Math.max(0, slice.y);
      if (value === 0) return; // skip zero-value slices (nothing to draw)

      const fraction = value / total;
      const angleEnd = angleStart + fraction * FULL_CIRCLE;
      const sliceColor = palette[index % palette.length];
      const percent = (fraction * 100).toFixed(1);

      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute(
        'd',
        this.buildSlicePath(cx, cy, radius, innerRadius, angleStart, angleEnd, fraction)
      );
      path.setAttribute('fill', sliceColor);
      path.setAttribute('stroke', colors.background);
      path.setAttribute('stroke-width', '2');

      // Accessibility + keyboard navigation
      path.setAttribute('role', 'img');
      path.setAttribute('aria-label', `${slice.label ?? slice.x}: ${slice.y} (${percent}%)`);
      path.setAttribute('tabindex', '-1');
      path.classList.add('data-point');
      setDataPointAttrs(path, {
        x: slice.label ?? slice.x,
        y: slice.y,
        seriesIndex: 0,
        index,
      });
      mainGroup.appendChild(path);

      // Optional percentage label at the slice mid-angle
      if (this.config.showLabels) {
        const midAngle = (angleStart + angleEnd) / 2;
        const labelRadius = innerRadius > 0 ? (radius + innerRadius) / 2 : radius * 0.65;
        const lx = cx + labelRadius * Math.sin(midAngle);
        const ly = cy - labelRadius * Math.cos(midAngle);

        const text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', String(lx));
        text.setAttribute('y', String(ly));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', colors.background);
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '600');
        text.textContent = `${percent}%`;
        mainGroup.appendChild(text);
      }

      angleStart = angleEnd;
    });
  }

  /** Point on a circle of the given radius at `angle` (0 = 12 o'clock, clockwise). */
  private point(cx: number, cy: number, r: number, angle: number): [number, number] {
    return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];
  }

  /**
   * Build the SVG path for one slice. Handles the full-circle case (a single 100%
   * slice) by drawing two arcs, since a single arc from a point back to itself
   * won't render.
   */
  private buildSlicePath(
    cx: number,
    cy: number,
    r: number,
    ir: number,
    a0: number,
    a1: number,
    fraction: number
  ): string {
    const largeArc = a1 - a0 > Math.PI ? 1 : 0;
    const isFull = fraction >= 0.9999;

    if (isFull) {
      // Two half-circle arcs for a complete ring/disc.
      const [tx, ty] = this.point(cx, cy, r, 0);
      const [bx, by] = this.point(cx, cy, r, Math.PI);
      let path = `M ${tx} ${ty} A ${r} ${r} 0 1 1 ${bx} ${by} A ${r} ${r} 0 1 1 ${tx} ${ty} Z`;
      if (ir > 0) {
        const [itx, ity] = this.point(cx, cy, ir, 0);
        const [ibx, iby] = this.point(cx, cy, ir, Math.PI);
        // Inner circle drawn in reverse so it cuts a hole (even-odd via subpath).
        path += ` M ${itx} ${ity} A ${ir} ${ir} 0 1 0 ${ibx} ${iby} A ${ir} ${ir} 0 1 0 ${itx} ${ity} Z`;
      }
      return path;
    }

    const [ox0, oy0] = this.point(cx, cy, r, a0);
    const [ox1, oy1] = this.point(cx, cy, r, a1);

    if (ir <= 0) {
      // Solid wedge from the center.
      return `M ${cx} ${cy} L ${ox0} ${oy0} A ${r} ${r} 0 ${largeArc} 1 ${ox1} ${oy1} Z`;
    }

    // Donut segment: outer arc forward, inner arc back.
    const [ix0, iy0] = this.point(cx, cy, ir, a0);
    const [ix1, iy1] = this.point(cx, cy, ir, a1);
    return (
      `M ${ox0} ${oy0} A ${r} ${r} 0 ${largeArc} 1 ${ox1} ${oy1} ` +
      `L ${ix1} ${iy1} A ${ir} ${ir} 0 ${largeArc} 0 ${ix0} ${iy0} Z`
    );
  }
}
