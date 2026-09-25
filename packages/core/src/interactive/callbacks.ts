/**
 * Event-callback plugin. Wires `onPointClick` / `onHover` to the chart's data
 * points (via delegated listeners, so cost does not grow with the point count).
 * Handlers may be passed directly or read from the chart config, so a content
 * chart can link out or drive app state.
 *
 * ```ts
 * import { callbacks } from '@chartlite/core/interactive';
 * new LineChart(el, {
 *   data,
 *   onPointClick: (p) => location.assign(`/detail/${p.x}`),
 *   plugins: [callbacks()],
 * }).render();
 * ```
 */

import type { ChartPlugin, PluginContext, ChartPointEvent } from '../types';
import { readPointEvent } from './shared';
import { trackHover } from './hover';

export interface CallbackHandlers {
  onPointClick?: (event: ChartPointEvent) => void;
  /**
   * Called when the hovered point changes (on line/area charts, the nearest
   * point to the pointer's x), and with `null` when the pointer leaves.
   */
  onHover?: (event: ChartPointEvent | null) => void;
}

export function callbacks(handlers: CallbackHandlers = {}): ChartPlugin {
  const owner = Symbol('callbacks');
  const bound = new WeakSet<SVGSVGElement>();
  // Read on every event so the latest config/handlers win after update().
  let current: PluginContext | null = null;
  const onPointClick = (): CallbackHandlers['onPointClick'] => handlers.onPointClick ?? current?.config.onPointClick;
  const onHover = (): CallbackHandlers['onHover'] => handlers.onHover ?? current?.config.onHover;

  return {
    name: 'callbacks',
    afterRender(ctx: PluginContext): void {
      const svg = ctx.svg;
      if (!svg) return;
      current = ctx;
      if (!onPointClick() && !onHover()) return;

      if (onPointClick()) {
        svg.querySelectorAll<SVGElement>('.data-point').forEach((pt) => {
          pt.style.cursor = 'pointer';
        });
      }

      // One delegated click listener per SVG; keyboard activation dispatches a
      // bubbling click on the focused point, so it lands here too.
      if (!bound.has(svg)) {
        bound.add(svg);
        svg.addEventListener('click', (event) => {
          const pt = event.target instanceof Element ? event.target.closest('.data-point') : null;
          if (pt) onPointClick()?.(readPointEvent(pt, event));
        });
      }

      trackHover(ctx, owner, (points, event) => {
        onHover()?.(points.length ? readPointEvent(points[0], event) : null);
      });
    },
  };
}
