/**
 * Event-callback plugin. Wires `onPointClick` / `onHover` to every `.data-point`.
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

export interface CallbackHandlers {
  onPointClick?: (event: ChartPointEvent) => void;
  /** Called on point enter, and with `null` on leave. */
  onHover?: (event: ChartPointEvent | null) => void;
}

export function callbacks(handlers: CallbackHandlers = {}): ChartPlugin {
  return {
    name: 'callbacks',
    afterRender(ctx: PluginContext): void {
      if (!ctx.svg) return;
      const onPointClick = handlers.onPointClick ?? ctx.config.onPointClick;
      const onHover = handlers.onHover ?? ctx.config.onHover;
      if (!onPointClick && !onHover) return;

      ctx.svg.querySelectorAll('.data-point').forEach((pt) => {
        if (onPointClick) {
          (pt as SVGElement).style.cursor = 'pointer';
          pt.addEventListener('click', (e) => onPointClick(readPointEvent(pt, e)));
        }
        if (onHover) {
          pt.addEventListener('mouseenter', (e) => onHover(readPointEvent(pt, e)));
          pt.addEventListener('mouseleave', () => onHover(null));
        }
      });
    },
  };
}
