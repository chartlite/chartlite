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

const SVG_NS = 'http://www.w3.org/2000/svg';

export class Sparkline extends BaseChart {
  protected config: SparklineConfig;

  constructor(container: HTMLElement | string, config: SparklineConfig) {
    // Sparklines default to a small, fixed size and no responsive observer.
    super(container, { width: 120, height: 32, responsive: false, ...config }, config.data);

    this.config = {
      type: 'line',
      curve: 'linear',
      showEndDot: true,
      strokeWidth: 1.5,
      fillOpacity: 0.15,
      ...config,
    };
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
    if (this.config.type === 'area' && n > 1) {
      const linePath = generateLinePath(points, this.config.curve);
      const areaPath = `${linePath} L ${points[n - 1].x},${h} L ${points[0].x},${h} Z`;
      const area = document.createElementNS(SVG_NS, 'path');
      area.setAttribute('d', areaPath);
      area.setAttribute('fill', color);
      area.setAttribute('opacity', String(this.config.fillOpacity));
      mainGroup.appendChild(area);
    }

    // The line itself
    if (n > 1) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', generateLinePath(points, this.config.curve));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', String(this.config.strokeWidth));
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.classList.add('sparkline-line');
      mainGroup.appendChild(path);
    }

    // Dot on the most recent point
    if (this.config.showEndDot) {
      const last = points[n - 1];
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('cx', String(last.x));
      dot.setAttribute('cy', String(last.y));
      dot.setAttribute('r', String(Math.max(1.5, (this.config.strokeWidth ?? 1.5) + 0.5)));
      dot.setAttribute('fill', color);
      dot.classList.add('sparkline-end-dot');
      mainGroup.appendChild(dot);
    }
  }
}
