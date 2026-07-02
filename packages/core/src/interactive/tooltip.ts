/**
 * Hover tooltip plugin.
 *
 * A tree-shakeable replacement for the legacy `TooltipPlugin` that reads the
 * `data-*` contract emitted by every chart, so it actually finds the points
 * (the old plugin's `[data-x][data-y]` selector matched nothing after the
 * point elements switched to the `.data-point` class).
 *
 * ```ts
 * import { LineChart } from '@chartlite/core';
 * import { tooltip } from '@chartlite/core/interactive';
 * new LineChart(el, { data, plugins: [tooltip()] }).render();
 * ```
 */

import type { ChartPlugin, PluginContext, ChartPointEvent } from '../types';
import { readPointEvent } from './shared';

export interface TooltipOptions {
  /** Custom content builder. Defaults to `"<series> — <x>: <y>"`. */
  formatter?: (event: ChartPointEvent) => string;
  /** Tooltip background (default: dark slate). */
  backgroundColor?: string;
  /** Text color (default: white). */
  textColor?: string;
  /** Inner padding in px (default: 6). */
  padding?: number;
  /** Corner radius in px (default: 6). */
  borderRadius?: number;
  /** Font size in px (default: 12). */
  fontSize?: number;
  /** Extra class name to apply to the tooltip element. */
  className?: string;
}

export function tooltip(options: TooltipOptions = {}): ChartPlugin {
  let el: HTMLDivElement | null = null;
  const format =
    options.formatter ??
    ((e: ChartPointEvent) => `${e.seriesName ? `${e.seriesName} — ` : ''}${e.x}: ${e.y}`);

  const ensure = (): HTMLDivElement => {
    if (el) return el;
    const pad = options.padding ?? 6;
    el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed',
      display: 'none',
      pointerEvents: 'none',
      zIndex: '1000',
      whiteSpace: 'nowrap',
      background: options.backgroundColor ?? 'rgba(17, 24, 39, 0.92)',
      color: options.textColor ?? '#ffffff',
      padding: `${pad}px ${pad + 2}px`,
      borderRadius: `${options.borderRadius ?? 6}px`,
      fontSize: `${options.fontSize ?? 12}px`,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    } as Partial<CSSStyleDeclaration>);
    if (options.className) el.className = options.className;
    document.body.appendChild(el);
    return el;
  };

  const move = (ev: MouseEvent): void => {
    if (!el) return;
    el.style.left = `${ev.clientX + 12}px`;
    el.style.top = `${ev.clientY + 12}px`;
  };

  return {
    name: 'tooltip',
    afterRender(ctx: PluginContext): void {
      if (!ctx.svg) return;
      const tip = ensure();
      ctx.svg.querySelectorAll('.data-point').forEach((pt) => {
        pt.addEventListener('mouseenter', (e) => {
          tip.textContent = format(readPointEvent(pt, e));
          tip.style.display = 'block';
          move(e as MouseEvent);
        });
        pt.addEventListener('mousemove', (e) => move(e as MouseEvent));
        pt.addEventListener('mouseleave', () => {
          tip.style.display = 'none';
        });
      });
    },
    beforeDestroy(): void {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      el = null;
    },
  };
}
