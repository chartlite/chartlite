/**
 * Machine-readable `data-*` attributes for rendered data-point elements.
 *
 * Every data mark (line/scatter point, bar, pie slice) and every series-level
 * shape (line path, area fill) carries these so the tree-shakeable interactivity
 * layer (`@chartlite/core/interactive`) can read semantic values straight off the
 * DOM — tooltips, crosshair anchoring, click/hover callbacks, and legend toggling
 * all work without the chart exposing its internal scales.
 *
 * These attribute names are part of the plugin contract. Keep them stable.
 */

export interface DataPointAttrs {
  /** The x value (category label or numeric). */
  x: string | number;
  /** The y value. */
  y: number;
  /** Series display name (omitted for single-series charts is fine — still set). */
  seriesName?: string;
  /** Zero-based series index (used by legend toggling to match elements). */
  seriesIndex?: number;
  /** Zero-based index of the point within its series. */
  index?: number;
  /** Pixel centre x within the chart's main group (for crosshair/tooltip anchoring). */
  cx?: number;
  /** Pixel centre y within the chart's main group. */
  cy?: number;
}

/** Apply the data-point attribute contract to a rendered element. */
export function setDataPointAttrs(el: Element, attrs: DataPointAttrs): void {
  el.setAttribute('data-x', String(attrs.x));
  el.setAttribute('data-y', String(attrs.y));
  if (attrs.seriesName !== undefined) el.setAttribute('data-series', attrs.seriesName);
  if (attrs.seriesIndex !== undefined) {
    el.setAttribute('data-series-index', String(attrs.seriesIndex));
  }
  if (attrs.index !== undefined) el.setAttribute('data-index', String(attrs.index));
  if (attrs.cx !== undefined) el.setAttribute('data-cx', String(attrs.cx));
  if (attrs.cy !== undefined) el.setAttribute('data-cy', String(attrs.cy));
}

/**
 * Tag a series-level shape (line path, area fill) with just its series index, so
 * legend toggling can show/hide the whole series, not only its point marks.
 */
export function setSeriesAttrs(el: Element, seriesIndex: number, seriesName?: string): void {
  el.setAttribute('data-series-index', String(seriesIndex));
  if (seriesName !== undefined) el.setAttribute('data-series', seriesName);
}
