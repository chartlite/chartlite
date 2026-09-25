/** Bar layout and drawing, shared by BarChart and ComboChart. */

import type { DataPoint, SeriesData } from '../types';
import { markDataPoint } from './dataAttrs';
import { svgEl } from './constants';

/** Bar thickness within a band, and the band offset of each side-by-side slot. */
export interface BarSlots {
  thickness: number;
  offset: (slot: number) => number;
}

/**
 * Split a category band of width `bw` into `slots` side-by-side bars with a
 * small gap. Bars are capped at 56px so sparse charts don't look blocky, and
 * the group is centred in the band.
 */
export function barSlots(bw: number, slots: number): BarSlots {
  const gap = slots > 1 ? Math.min(4, bw * 0.04) : 0;
  const thickness = Math.min((bw - gap * (slots - 1)) / slots, 56);
  const inset = (bw - slots * thickness - (slots - 1) * gap) / 2;
  return { thickness, offset: (slot) => inset + slot * (thickness + gap) };
}

/** Draw one bar as a focusable `.data-point` carrying the `data-*` contract. */
export function drawBar(
  parent: Element,
  rect: { x: number; y: number; width: number; height: number },
  rx: number,
  color: string,
  series: SeriesData,
  seriesIndex: number,
  index: number,
  d: DataPoint,
  multi: boolean
): void {
  const el = svgEl('rect', { ...rect, rx: rx || undefined, fill: color }, parent);
  el.classList.add('bar');
  markDataPoint(
    el, `${multi ? `${series.name}, ` : ''}Bar: ${d.x}, value ${d.y}`,
    d.x, d.y, series.name, seriesIndex, index,
    rect.x + rect.width / 2, rect.y + rect.height / 2
  );
}
