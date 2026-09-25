/**
 * Shared layout constants for chart rendering (title, legend, axes, margins).
 * Extracted from BaseChart so the render modules and the base class share one
 * source of truth.
 */
export const CHART_DEFAULTS = {
  /** Outer padding between the SVG edge and any content. */
  PADDING: 16,

  // Title
  TITLE_FONT_SIZE: 16,
  /** Vertical space reserved for the title row (font + gap below it). */
  TITLE_HEIGHT: 28,

  // Legend
  LEGEND_FONT_SIZE: 12,
  /** Height of one legend row. */
  LEGEND_ROW_HEIGHT: 20,
  LEGEND_ICON_SIZE: 10,
  LEGEND_ICON_MARGIN: 6,
  LEGEND_ITEM_SPACING: 16,

  // Axes
  AXIS_LABEL_FONT_SIZE: 12,
  /** Gap between a tick label and the plot edge. */
  AXIS_LABEL_OFFSET: 8,
  AXIS_LABEL_BOTTOM_OFFSET: 18,
  /** Space reserved under the plot for x-axis labels. */
  X_AXIS_HEIGHT: 28,
  /** Approximate advance width of one 12px system-ui character, for layout. */
  CHAR_WIDTH: 6.6,

  // Resize
  RESIZE_DEBOUNCE_MS: 150,

  // Default dimensions
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 400,
} as const;

/** Maximum rendered points shared across all series in a chart. */
export const CHART_POINT_BUDGET = 500;

const SVG_NS = 'http://www.w3.org/2000/svg';

const isNumber = (value: string | number): value is number => typeof value === 'number';

/** Round a pixel coordinate to 2 decimals so SVG output stays compact. */
export const round = (value: number): number => Math.round(value * 100) / 100;

/** Point on a circle at `angle` (radians; 0 = 12 o'clock, clockwise), rounded. */
export const polar = (cx: number, cy: number, r: number, angle: number): [number, number] => [
  round(cx + r * Math.sin(angle)),
  round(cy - r * Math.cos(angle)),
];

/**
 * SVG path for a ring segment between radii `ir` and `r` (a wedge from the
 * centre when `ir` is 0) from angle `a0` to `a1`. A full sweep draws two
 * half-circle arcs (an arc back to its own start renders nothing), and `cap`
 * rounds the ends of partial segments.
 */
export function arcPath(cx: number, cy: number, r: number, ir: number, a0: number, a1: number, cap = false): string {
  const circle = (radius: number, sweep: number): string => {
    const [x0, y0] = polar(cx, cy, radius, 0);
    const [x1, y1] = polar(cx, cy, radius, Math.PI);
    const arc = `A${round(radius)} ${round(radius)} 0 1 ${sweep} `;
    return `M${x0} ${y0}${arc}${x1} ${y1}${arc}${x0} ${y0}Z`;
  };
  // The inner circle runs the other way, so it cuts a hole.
  if (a1 - a0 >= Math.PI * 2 - 1e-3) return circle(r, 1) + (ir > 0 ? circle(ir, 0) : '');

  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [ox0, oy0] = polar(cx, cy, r, a0);
  const [ox1, oy1] = polar(cx, cy, r, a1);
  const outer = `M${ox0} ${oy0}A${round(r)} ${round(r)} 0 ${large} 1 ${ox1} ${oy1}`;
  if (ir <= 0) return `M${round(cx)} ${round(cy)}L${outer.slice(1)}Z`;

  const [ix0, iy0] = polar(cx, cy, ir, a0);
  const [ix1, iy1] = polar(cx, cy, ir, a1);
  const end = round((r - ir) / 2);
  const join = cap ? `A${end} ${end} 0 0 1 ` : 'L';
  return `${outer}${join}${ix1} ${iy1}A${round(ir)} ${round(ir)} 0 ${large} 0 ${ix0} ${iy0}${cap ? `${join}${ox0} ${oy0}` : ''}Z`;
}

/** SVG text alignment attributes. */
export interface TextAlign {
  'text-anchor': 'start' | 'middle' | 'end';
  'dominant-baseline': 'auto' | 'middle' | 'hanging';
}

/**
 * Text alignment for a label placed on one side of a point: `dx`/`dy` are -1
 * (left/above), 0 (centred) or 1 (right/below).
 */
export const sideAlign = (dx: number, dy: number): TextAlign => ({
  'text-anchor': dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle',
  'dominant-baseline': dy < 0 ? 'auto' : dy > 0 ? 'hanging' : 'middle',
});

/** Estimated rendered width of a 12px label, used instead of forcing layout. */
export const textWidth = (text: string): number => text.length * CHART_DEFAULTS.CHAR_WIDTH;

/** Create a typed SVG element without repeating the namespace at every call site. */
export function createSVGElement<K extends keyof SVGElementTagNameMap>(
  tagName: K
): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tagName);
}

/**
 * Create an SVG element, set its attributes (numbers are rounded, `undefined`
 * values skipped), and optionally append it to `parent`.
 */
export function svgEl<K extends keyof SVGElementTagNameMap>(
  tagName: K,
  attrs: Record<string, string | number | undefined>,
  parent?: Element
): SVGElementTagNameMap[K] {
  const el = createSVGElement(tagName);
  for (const key in attrs) {
    const value = attrs[key];
    if (value !== undefined) {
      el.setAttribute(key, String(isNumber(value) ? round(value) : value));
    }
  }
  parent?.appendChild(el);
  return el;
}

/** Create an SVG `<g>`, translated to (x, y) only when non-zero. */
export function createGroup(x = 0, y = 0): SVGGElement {
  const g = createSVGElement('g');
  if (x !== 0 || y !== 0) {
    g.setAttribute('transform', `translate(${round(x)},${round(y)})`);
  }
  return g;
}
