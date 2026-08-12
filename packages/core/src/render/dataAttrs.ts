/** Machine-readable attributes shared with the optional interactivity layer. */

export function setDataPointAttrs(
  el: Element,
  x: string | number,
  y: number,
  seriesName?: string,
  seriesIndex?: number,
  index?: number,
  cx?: number,
  cy?: number
): void {
  el.setAttribute('data-x', String(x));
  el.setAttribute('data-y', String(y));
  if (seriesName !== undefined) el.setAttribute('data-series', seriesName);
  if (seriesIndex !== undefined) el.setAttribute('data-series-index', String(seriesIndex));
  if (index !== undefined) el.setAttribute('data-index', String(index));
  if (cx !== undefined) el.setAttribute('data-cx', String(cx));
  if (cy !== undefined) el.setAttribute('data-cy', String(cy));
}

/** Tag a series-level shape for legend toggling. */
export function setSeriesAttrs(el: Element, seriesIndex: number, seriesName?: string): void {
  el.setAttribute('data-series-index', String(seriesIndex));
  if (seriesName !== undefined) el.setAttribute('data-series', seriesName);
}
