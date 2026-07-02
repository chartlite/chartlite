/**
 * Shared helpers for the interactivity plugins. Kept dependency-free so the
 * `@chartlite/core/interactive` entry stays tiny and tree-shakeable.
 */

import type { ChartPointEvent } from '../types';

/**
 * Read the {@link ChartPointEvent} contract off a rendered `.data-point` element
 * (see `render/dataAttrs.ts`). Preserves a numeric x when the value round-trips
 * cleanly through the string attribute.
 */
export function readPointEvent(el: Element, originalEvent: Event): ChartPointEvent {
  const xAttr = el.getAttribute('data-x') ?? '';
  const yAttr = el.getAttribute('data-y');
  const seriesName = el.getAttribute('data-series') ?? undefined;
  const seriesIndex = Number(el.getAttribute('data-series-index') ?? '0');
  const index = Number(el.getAttribute('data-index') ?? '0');

  const xNum = Number(xAttr);
  const x = xAttr !== '' && !Number.isNaN(xNum) && String(xNum) === xAttr ? xNum : xAttr;

  return {
    x,
    y: yAttr === null ? NaN : Number(yAttr),
    seriesName,
    seriesIndex,
    index,
    element: el,
    originalEvent,
  };
}
