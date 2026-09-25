/**
 * Shared pointer tracking for the interactivity plugins.
 *
 * One delegated `pointermove`/`pointerleave` pair per chart SVG (bound once,
 * surviving re-renders) resolves the pointer to the data points it is "over":
 *
 * - Line, area and combo charts snap to the nearest x position and report every
 *   series there, so a thin line is as easy to hover as a bar, and one tooltip
 *   can compare series.
 * - Scatter points are picked by proximity (within {@link RADIUS} px).
 * - Everything else (bars, slices, rings) uses the mark under the pointer.
 *
 * Each plugin registers a listener under its own key, so re-renders replace
 * rather than stack handlers.
 */

import type { PluginContext } from '../types';

/** Points reported by one hover update; empty when the pointer left the data. */
export type HoverListener = (points: SVGElement[], event: Event) => void;

interface HoverState {
  listeners: Map<symbol, HoverListener>;
  points: Array<{ el: SVGElement; x: number; y: number }>;
  /** Snap to the nearest x (line/area/combo) instead of the nearest point. */
  snapX: boolean;
  margin: { left: number; top: number };
  /** Chart width in SVG units (the viewBox width), to undo CSS scaling. */
  width: number;
  current: SVGElement[];
}

const states = new WeakMap<SVGSVGElement, HoverState>();

/** Pointer distance (in chart px) within which a scatter point counts as hovered. */
const RADIUS = 24;

function resolve(svg: SVGSVGElement, state: HoverState, event: Event): SVGElement[] {
  const target = event.target instanceof Element ? event.target.closest<SVGElement>('.data-point') : null;
  // Without pointer coordinates (e.g. synthetic events in tests), use the mark itself.
  if ((target && !state.snapX) || !(event instanceof MouseEvent)) return target ? [target] : [];

  const rect = svg.getBoundingClientRect();
  const scale = rect.width ? state.width / rect.width : 1;
  const px = (event.clientX - rect.left) * scale - state.margin.left;
  const py = (event.clientY - rect.top) * scale - state.margin.top;

  let best: SVGElement[] = [];
  let bestDistance = Infinity;
  for (const point of state.points) {
    // Skip series hidden by legendToggle().
    if (point.el.style.display === 'none') continue;
    const distance = state.snapX ? Math.abs(point.x - px) : Math.hypot(point.x - px, point.y - py);
    if (distance < bestDistance - 0.5) {
      bestDistance = distance;
      best = [point.el];
    } else if (state.snapX && distance <= bestDistance + 0.5) {
      best.push(point.el);
    }
  }
  if (state.snapX) return best;
  if (target) return [target];
  return bestDistance <= RADIUS ? best : [];
}

/**
 * Register `listener` (keyed by the plugin's `owner` symbol) for pointer updates on the chart, and
 * refresh the point index. Call from a plugin's `afterRender`.
 */
export function trackHover(ctx: PluginContext, owner: symbol, listener: HoverListener): void {
  const svg = ctx.svg;
  if (!svg) return;

  let state = states.get(svg);
  if (!state) {
    const created: HoverState = { listeners: new Map(), points: [], snapX: false, margin: { left: 0, top: 0 }, width: 0, current: [] };
    state = created;
    states.set(svg, created);
    const emit = (points: SVGElement[], event: Event): void => {
      if (points.length === created.current.length && points.every((p, i) => p === created.current[i])) return;
      created.current = points;
      created.listeners.forEach((fn) => fn(points, event));
    };
    svg.addEventListener('pointermove', (event) => emit(resolve(svg, created, event), event));
    svg.addEventListener('pointerleave', (event) => emit([], event));
  }

  state.listeners.set(owner, listener);
  state.current = [];
  state.margin = ctx.dimensions.margin;
  state.width = ctx.dimensions.width;
  // Line/area/combo charts draw series strokes (paths tagged with a series
  // index that are not themselves data points); snap those to the nearest x.
  state.snapX = !!svg.querySelector('path[data-series-index]:not(.data-point)');
  state.points = [];
  svg.querySelectorAll<SVGElement>('.data-point').forEach((el) => {
    const x = el.getAttribute('data-cx');
    const y = el.getAttribute('data-cy');
    if (x !== null && y !== null) {
      state!.points.push({ el, x: Number(x), y: Number(y) });
    }
  });
}

/** Resolve a point's display color: its own fill, else its series' stroke. */
export function pointColor(svg: SVGSVGElement, el: Element): string | undefined {
  const fill = el.getAttribute('fill');
  if (fill && fill !== 'transparent' && fill !== 'none' && !fill.startsWith('url(')) return fill;
  const index = el.getAttribute('data-series-index');
  const series = svg.querySelector(`path[data-series-index="${index}"]:not(.data-point)`);
  return series?.getAttribute('stroke') ?? series?.getAttribute('fill') ?? undefined;
}
