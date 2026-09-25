/**
 * Sparkline — a tiny, axis-less, label-less inline chart for metrics.
 *
 * Built for the "live numbers on a landing page" use case: it strips the axes,
 * title, legend, and margins that the cartesian charts add, drawing just the data
 * shape (line or filled area) with an optional dot on the latest point.
 */

import { BaseChart } from './BaseChart';
import type { SparklineConfig, Dimensions } from '../types';
import { createLinearScale, generateLinePath } from '../utils';
import { markDataPoint } from '../render/dataAttrs';
import { round, svgEl } from '../render/constants';
import type { LegendItem } from '../render/legend';

export class Sparkline extends BaseChart {
  declare protected config: SparklineConfig;

  constructor(container: HTMLElement | string, config: SparklineConfig) {
    // Sparklines default to a small, fixed size and no responsive observer.
    super(
      container,
      {
        width: 120,
        height: 32,
        responsive: false,
        curve: 'linear',
        showEndDot: true,
        strokeWidth: 1.5,
        fillOpacity: 0.15,
        ...config,
      },
      config.data,
      'Sparkline'
    );
  }

  /** Sparklines never show a legend. */
  protected legendItems(): LegendItem[] {
    return [];
  }

  /** Sparklines use tight uniform padding instead of axis margins. */
  protected calculateDimensions(width: number, height: number): Dimensions {
    const pad = 3; // room for the stroke width and the end dot
    return {
      width,
      height,
      margin: { top: pad, right: pad, bottom: pad, left: pad },
    };
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();
    const { margin } = this.dimensions;
    const w = this.dimensions.width - margin.left - margin.right;
    const h = this.dimensions.height - margin.top - margin.bottom;

    const mainGroup = this.createGroup(margin.left, margin.top);
    mainGroup.classList.add('chart-main');
    this.svg.appendChild(mainGroup);

    const data = this.data;
    if (data.length === 0) return;

    const color =
      (this.config.colors && this.config.colors[0]) ||
      this.seriesData[0]?.color ||
      colors.primary;

    const ys = data.map((d) => d.y);
    let yMin = Math.min(...ys);
    let yMax = Math.max(...ys);
    if (yMin === yMax) {
      // Flat series: center the line vertically.
      yMin -= 1;
      yMax += 1;
    }

    const yScale = createLinearScale([yMin, yMax], [h, 0]);
    const n = data.length;
    const points = data.map((d, i) => ({
      x: n === 1 ? w / 2 : (i / (n - 1)) * w,
      y: yScale(d.y),
    }));

    // Filled area under the line (drawn first, behind the line)
    const line = n > 1 ? generateLinePath(points, this.config.curve) : '';
    if ((this.config.variant ?? this.config.type) === 'area' && line) {
      svgEl('path', {
        d: `${line}L${round(points[n - 1].x)},${round(h)}L${round(points[0].x)},${round(h)}Z`,
        fill: color,
        opacity: this.config.fillOpacity,
      }, mainGroup);
    }

    // The line itself
    if (line) {
      svgEl('path', {
        class: 'sparkline-line',
        d: line,
        fill: 'none',
        stroke: color,
        'stroke-width': this.config.strokeWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }, mainGroup);
    }

    // Dot on the most recent point
    if (this.config.showEndDot) {
      const last = points[n - 1];
      svgEl('circle', {
        class: 'sparkline-end-dot',
        cx: last.x,
        cy: last.y,
        r: Math.max(1.5, (this.config.strokeWidth ?? 1.5) + 0.5),
        fill: color,
        'aria-hidden': 'true',
      }, mainGroup);
    }

    // Point-level hit targets keep tiny sparklines keyboard- and plugin-accessible.
    data.forEach((point, index) => {
      const { x, y } = points[index];
      const hitTarget = svgEl('circle', { cx: x, cy: y, r: 6, fill: 'transparent' }, mainGroup);
      markDataPoint(hitTarget, `${point.x}: ${point.y}`, point.x, point.y, this.seriesData[0]?.name, 0, index, x, y);
    });
  }
}
