/**
 * Crosshair / focus-line plugin. On hover of a data point it draws a guide line
 * (vertical, and optionally horizontal) across the plot area. Best for line/area
 * and scatter charts, which emit pixel centres (`data-cx`/`data-cy`).
 *
 * ```ts
 * import { crosshair } from '@chartlite/core/interactive';
 * new LineChart(el, { data, plugins: [crosshair({ horizontal: true })] }).render();
 * ```
 */

import type { ChartPlugin, PluginContext } from '../types';

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

      main.querySelectorAll('.data-point').forEach((pt) => {
        const cx = pt.getAttribute('data-cx');
        const cy = pt.getAttribute('data-cy');
        if (cx === null) return;
        pt.addEventListener('mouseenter', () => {
          vLine.setAttribute('x1', cx);
          vLine.setAttribute('x2', cx);
          vLine.setAttribute('y1', '0');
          vLine.setAttribute('y2', String(plotH));
          if (hLine && cy !== null) {
            hLine.setAttribute('x1', '0');
            hLine.setAttribute('x2', String(plotW));
            hLine.setAttribute('y1', cy);
            hLine.setAttribute('y2', cy);
          }
          group.style.display = '';
        });
        pt.addEventListener('mouseleave', () => {
          group.style.display = 'none';
        });
      });
    },
  };
}
