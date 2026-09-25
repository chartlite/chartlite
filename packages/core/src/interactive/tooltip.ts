/**
 * Hover tooltip plugin.
 *
 * Reads the `data-*` contract emitted by every chart. On line, area and combo
 * charts it snaps to the nearest x and lists every series there; on other
 * charts it describes the hovered mark. Values use the chart's
 * `valueFormatter`, and the tooltip also follows keyboard focus.
 *
 * ```ts
 * import { LineChart } from '@chartlite/core';
 * import { tooltip } from '@chartlite/core/interactive';
 * new LineChart(el, { data, plugins: [tooltip()] }).render();
 * ```
 */

import type { ChartPlugin, PluginContext, ChartPointEvent } from '../types';
import { readPointEvent } from './shared';
import type { KeyboardActivationEvent } from '../a11y/keyboard';
import { pointColor, trackHover } from './hover';

export interface TooltipOptions {
  /**
   * Custom text for one point. When several series share the hovered x, the
   * results are shown one per line. Defaults to a formatted header + value rows.
   */
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

/** Gap between the pointer (or focused mark) and the tooltip, in px. */
const OFFSET = 12;

export function tooltip(options: TooltipOptions = {}): ChartPlugin {
  let el: HTMLDivElement | null = null;
  let active: SVGElement[] = [];
  const subscribed = new WeakSet<object>();
  const owner = Symbol('tooltip');

  const ensure = (): HTMLDivElement => {
    if (el) return el;
    const pad = options.padding ?? 6;
    el = document.createElement('div');
    // Mirrors data already exposed to assistive tech (labels, live region).
    el.setAttribute('aria-hidden', 'true');
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
      lineHeight: '1.5',
      fontFamily: 'system-ui, sans-serif',
      fontVariantNumeric: 'tabular-nums',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
    } satisfies Partial<CSSStyleDeclaration>);
    if (options.className) el.className = options.className;
    document.body.appendChild(el);
    return el;
  };

  /** Place the tooltip beside (x, y), flipping to stay inside the viewport. */
  const place = (tip: HTMLDivElement, x: number, y: number): void => {
    const { offsetWidth: w, offsetHeight: h } = tip;
    const left = x + OFFSET + w > window.innerWidth ? x - OFFSET - w : x + OFFSET;
    const top = y + OFFSET + h > window.innerHeight ? y - OFFSET - h : y + OFFSET;
    tip.style.left = `${Math.max(0, left)}px`;
    tip.style.top = `${Math.max(0, top)}px`;
  };

  /** Place the tooltip beside a mark (keyboard focus, coordinate-less events). */
  const anchor = (tip: HTMLDivElement, mark: Element): void => {
    const box = mark.getBoundingClientRect();
    place(tip, box.left + box.width / 2, box.top + box.height / 2);
  };

  /** Temporarily reveal hidden (transparent) markers for the hovered points. */
  const highlight = (svg: SVGSVGElement, points: SVGElement[]): void => {
    active.forEach((mark) => mark.style.removeProperty('fill'));
    active = [];
    for (const point of points) {
      if (point.tagName !== 'circle' || point.getAttribute('fill') !== 'transparent') continue;
      point.style.fill = pointColor(svg, point) ?? '';
      active.push(point);
    }
  };

  const fill = (tip: HTMLDivElement, ctx: PluginContext, points: SVGElement[], event: Event): void => {
    const events = points.map((point) => readPointEvent(point, event));
    tip.textContent = '';
    if (options.formatter) {
      tip.style.whiteSpace = 'pre';
      tip.textContent = events.map(options.formatter).join('\n');
      return;
    }

    const { valueFormatter, xFormatter } = ctx.config;
    const header = document.createElement('div');
    header.style.opacity = '0.75';
    header.textContent = xFormatter ? xFormatter(events[0].x) : String(events[0].x);
    tip.appendChild(header);

    const named = new Set(events.map((e) => e.seriesName)).size > 1;
    events.forEach((e) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '6px';
      const color = pointColor(ctx.svg!, e.element);
      if (color) {
        const swatch = document.createElement('span');
        Object.assign(swatch.style, { width: '8px', height: '8px', borderRadius: '50%', background: color });
        row.appendChild(swatch);
      }
      if (named && e.seriesName) row.appendChild(document.createTextNode(e.seriesName));
      const value = document.createElement('b');
      value.style.marginLeft = named ? 'auto' : '0';
      value.style.paddingLeft = named ? '12px' : '0';
      value.textContent = valueFormatter ? valueFormatter(e.y) : e.y.toLocaleString();
      row.appendChild(value);
      tip.appendChild(row);
    });
  };

  const hide = (): void => {
    if (el) el.style.display = 'none';
    active.forEach((mark) => mark.style.removeProperty('fill'));
    active = [];
  };

  return {
    name: 'tooltip',
    afterRender(ctx: PluginContext): void {
      const svg = ctx.svg;
      if (!svg) return;
      const tip = ensure();
      active = [];

      trackHover(ctx, owner, (points, event) => {
        if (!points.length) return hide();
        fill(tip, ctx, points, event);
        highlight(svg, points);
        tip.style.display = 'block';
        if (event instanceof MouseEvent) place(tip, event.clientX, event.clientY);
        else anchor(tip, points[0]);
      });

      // Keyboard users get the same tooltip, anchored to the focused mark.
      if (!subscribed.has(ctx.chart)) {
        subscribed.add(ctx.chart);
        ctx.on('datapoint:focus', (data: KeyboardActivationEvent) => {
          fill(tip, ctx, [data.element], new Event('focus'));
          highlight(svg, [data.element]);
          tip.style.display = 'block';
          anchor(tip, data.element);
        });
        ctx.on('datapoint:blur', hide);
      }
    },
    beforeDestroy(): void {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      el = null;
    },
  };
}
