/**
 * Crosshair / focus-line plugin. On hover of a data point it draws a guide line
 * (vertical, and optionally horizontal) across the plot area. On line/area/combo
 * charts it snaps to the nearest x, so it tracks the pointer anywhere in the plot.
 *
 * ```ts
 * import { crosshair } from '@chartlite/core/interactive';
 * new LineChart(el, { data, plugins: [crosshair({ horizontal: true })] }).render();
 * ```
 */

import type { ChartPlugin, PluginContext } from '../types';
import { trackHover } from './hover';

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface CrosshairOptions {
  /** Line color (default: translucent slate). */
  color?: string;
  /** Line width in px (default: 1). */
  width?: number;
  /** Also draw a horizontal line through the point (default: false). */
  horizontal?: boolean;
  /** SVG dash pattern (default: '4 3'). */
  dash?: string;
}

export function crosshair(options: CrosshairOptions = {}): ChartPlugin {
  const owner = Symbol('crosshair');
  return {
    name: 'crosshair',
    afterRender(ctx: PluginContext): void {
      if (!ctx.svg) return;
      const main = ctx.svg.querySelector('g.chart-main');
      if (!main) return;

      const { width, height, margin } = ctx.dimensions;
      const plotW = width - margin.left - margin.right;
      const plotH = height - margin.top - margin.bottom;
      const color = options.color ?? 'rgba(107, 114, 128, 0.6)';
      const strokeWidth = String(options.width ?? 1);
      const dash = options.dash ?? '4 3';

      const group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('class', 'chart-crosshair');
      group.setAttribute('pointer-events', 'none');
      group.style.display = 'none';

      const makeLine = (): SVGLineElement => {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-dasharray', dash);
        group.appendChild(line);
        return line;
      };

      const vLine = makeLine();
      const hLine = options.horizontal ? makeLine() : null;
      main.appendChild(group);

      // Follows the same snapping as the tooltip: the nearest x on line/area
      // charts, the hovered mark elsewhere.
      trackHover(ctx, owner, (points) => {
        const cx = points[0]?.getAttribute('data-cx');
        if (!cx) {
          group.style.display = 'none';
          return;
        }
        vLine.setAttribute('x1', cx);
        vLine.setAttribute('x2', cx);
        vLine.setAttribute('y1', '0');
        vLine.setAttribute('y2', String(plotH));
        const cy = points[0].getAttribute('data-cy');
        if (hLine && cy !== null && points.length === 1) {
          hLine.setAttribute('x1', '0');
          hLine.setAttribute('x2', String(plotW));
          hLine.setAttribute('y1', cy);
          hLine.setAttribute('y2', cy);
          hLine.style.display = '';
        } else if (hLine) {
          hLine.style.display = 'none';
        }
        group.style.display = '';
      });
    },
  };
}
