/** Machine-readable attributes shared with the optional interactivity layer. */

import { round } from './constants';

/**
 * Make `el` a data point: a focusable, labelled `.data-point` (for keyboard
 * navigation and screen readers) carrying the `data-*` contract.
 */
export function markDataPoint(
  el: Element,
  label: string,
  x: string | number,
  y: number,
  seriesName?: string,
  seriesIndex?: number,
  index?: number,
  cx?: number,
  cy?: number
): void {
  el.classList.add('data-point');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', label);
  el.setAttribute('tabindex', '-1'); // Managed by keyboard navigation
  el.setAttribute('data-x', String(x));
  el.setAttribute('data-y', String(y));
  if (seriesName !== undefined) el.setAttribute('data-series', seriesName);
  if (seriesIndex !== undefined) el.setAttribute('data-series-index', String(seriesIndex));
  if (index !== undefined) el.setAttribute('data-index', String(index));
  if (cx !== undefined) el.setAttribute('data-cx', String(round(cx)));
  if (cy !== undefined) el.setAttribute('data-cy', String(round(cy)));
}

/** Tag a series-level shape for legend toggling. */
export function setSeriesAttrs(el: Element, seriesIndex: number, seriesName?: string): void {
  el.setAttribute('data-series-index', String(seriesIndex));
  if (seriesName !== undefined) el.setAttribute('data-series', seriesName);
}
