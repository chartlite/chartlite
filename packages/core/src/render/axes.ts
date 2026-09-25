/**
 * Shared cartesian axis layout and rendering.
 *
 * Linear axes are "niced": the domain is widened to round tick values so data
 * never touches the plot edge and labels read 0 / 2,000 / 4,000 rather than the
 * raw data extremes. Categorical labels are thinned when they would collide.
 */

import { getThemeColors, calculateNiceTicks, tickFormatter } from '../utils';
import { CHART_DEFAULTS, svgEl, textWidth } from './constants';

type ThemeColors = ReturnType<typeof getThemeColors>;
type ValueFormat = (value: number) => string;

export interface LinearAxis {
  min: number;
  max: number;
  ticks: number[];
  format: ValueFormat;
}

/**
 * Build a niced linear axis for the data extent `[min, max]` spanning `pixels`,
 * with roughly one tick per `spacing` px. `zero` forces the baseline into the
 * domain (bars, areas); otherwise zero is only included when the data already
 * sits close to it, so line charts use their vertical space.
 */
export function linearAxis(
  min: number,
  max: number,
  pixels: number,
  spacing: number,
  zero: boolean,
  format?: ValueFormat
): LinearAxis {
  if (zero || (min > 0 && min < (max - min) / 4)) min = Math.min(min, 0);
  if (zero) max = Math.max(max, 0);
  if (min === max && !min) max = 1;
  const ticks = calculateNiceTicks(min, max, Math.max(2, Math.round(pixels / spacing)));
  return {
    min: ticks[0],
    max: ticks[ticks.length - 1],
    ticks,
    format: format || tickFormatter(ticks),
  };
}

/** Widest formatted tick label, in px. */
export function labelWidth(labels: string[]): number {
  let widest = 0;
  for (const label of labels) widest = Math.max(widest, textWidth(label));
  return widest;
}

/** Group that styles every tick label inside it (muted, 12px). */
function labelGroup(parent: Element, colors: ThemeColors, anchor: string): SVGGElement {
  return svgEl('g', {
    class: 'chart-axis-labels',
    fill: colors.text,
    'fill-opacity': 0.7,
    'font-size': CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE,
    'text-anchor': anchor,
  }, parent);
}

function label(parent: Element, x: number, y: number, text: string, middle?: boolean): void {
  svgEl('text', { x, y, dy: middle ? '.32em' : undefined }, parent).textContent = text;
}

/** Truncate a label to roughly `maxWidth` px with an ellipsis. */
function fit(text: string, maxWidth: number): string {
  const chars = Math.floor(maxWidth / CHART_DEFAULTS.CHAR_WIDTH);
  return text.length > chars ? `${text.slice(0, Math.max(1, chars - 1))}…` : text;
}

/** Gridlines as a single path (one DOM node, however many ticks). */
export function drawGrid(parent: Element, d: string, colors: ThemeColors): void {
  if (d) svgEl('path', { class: 'chart-grid', d, stroke: colors.grid, fill: 'none' }, parent);
}

/** Horizontal gridlines and left tick labels for a linear y axis. */
export function drawLinearY(
  parent: Element,
  axis: LinearAxis,
  scale: (v: number) => number,
  width: number,
  colors: ThemeColors
): void {
  drawGrid(parent, axis.ticks.map((t) => `M0,${Math.round(scale(t)) + 0.5}H${Math.round(width)}`).join(''), colors);
  const g = labelGroup(parent, colors, 'end');
  for (const t of axis.ticks) label(g, -CHART_DEFAULTS.AXIS_LABEL_OFFSET, scale(t), axis.format(t), true);
}

/** Vertical gridlines and bottom tick labels for a linear x axis. */
export function drawLinearX(
  parent: Element,
  axis: LinearAxis,
  scale: (v: number) => number,
  height: number,
  colors: ThemeColors
): void {
  drawGrid(parent, axis.ticks.map((t) => `M${Math.round(scale(t)) + 0.5},0V${Math.round(height)}`).join(''), colors);
  const g = labelGroup(parent, colors, 'middle');
  for (const t of axis.ticks) {
    label(g, scale(t), height + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET, axis.format(t));
  }
}

/**
 * Indices of the category labels to draw: all of them when every band has room
 * (`step >= minGap`), otherwise every `stride`-th label (at least `minGap` px
 * apart) plus the last one. A stride that lands exactly on the last label is
 * preferred so the spacing is perfectly even.
 */
function pickLabels(count: number, step: number, minGap: number): number[] {
  if (count < 3 || step >= minGap) return Array.from({ length: count }, (_, i) => i);
  const last = count - 1;
  const gap = Math.ceil(minGap / Math.max(step, 1e-6));
  let stride = gap;
  while (last % stride && stride < gap * 1.5) stride++;
  if (last % stride) stride = gap;
  const picked = [0];
  for (let i = stride; last - i >= gap; i += stride) picked.push(i);
  picked.push(last);
  return picked;
}

/**
 * Bottom category labels at band centres. Labels that overflow their band are
 * shortened with an ellipsis when the band still fits ~8 characters; otherwise
 * evenly spaced labels (always including both ends) are drawn so neighbours
 * never collide.
 */
export function drawCategoryX(
  parent: Element,
  labels: string[],
  center: (i: number) => number,
  width: number,
  height: number,
  colors: ThemeColors
): void {
  const step = width / Math.max(1, labels.length);
  const truncate = step - 8 >= 8 * CHART_DEFAULTS.CHAR_WIDTH;
  const widest = labelWidth(labels);
  const g = labelGroup(parent, colors, 'middle');
  for (const i of pickLabels(labels.length, truncate ? Infinity : step, widest + 12)) {
    const text = truncate ? fit(labels[i], step - 8) : labels[i];
    // Keep thinned end labels on the canvas (the right margin is only PADDING wide).
    const half = textWidth(text) / 2;
    const x = truncate ? center(i) : Math.min(Math.max(center(i), half - CHART_DEFAULTS.PADDING), width + CHART_DEFAULTS.PADDING - half);
    label(g, x, height + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET, text);
  }
}

/**
 * Left category labels at band centres, truncated to `maxWidth`. When bands are
 * shorter than a line of text, evenly spaced labels (always including both
 * ends) are drawn so rows never overlap.
 */
export function drawCategoryY(
  parent: Element,
  labels: string[],
  center: (i: number) => number,
  height: number,
  maxWidth: number,
  colors: ThemeColors
): void {
  const step = height / Math.max(1, labels.length);
  const g = labelGroup(parent, colors, 'end');
  for (const i of pickLabels(labels.length, step, CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE * 1.4)) {
    label(g, -CHART_DEFAULTS.AXIS_LABEL_OFFSET, center(i), fit(labels[i], maxWidth), true);
  }
}

/** The axis baseline (slightly stronger than gridlines). */
export function drawBaseline(parent: Element, d: string, colors: ThemeColors): void {
  svgEl('path', { class: 'chart-baseline', d, stroke: colors.text, 'stroke-opacity': 0.25, fill: 'none' }, parent);
}
