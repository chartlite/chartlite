/**
 * Shared layout constants for chart rendering (title, legend, axes, margins).
 * Extracted from BaseChart so the render modules and the base class share one
 * source of truth.
 */
export const CHART_DEFAULTS = {
  // Title
  TITLE_FONT_SIZE: 18,
  TITLE_TOP_PADDING: 5,
  TITLE_BOTTOM_PADDING: 10,

  // Legend
  LEGEND_FONT_SIZE: 12,
  LEGEND_PADDING: 15,
  LEGEND_ICON_SIZE: 12,
  LEGEND_ICON_MARGIN: 6,
  LEGEND_ITEM_SPACING: 20,

  // Axes
  AXIS_LABEL_FONT_SIZE: 12,
  AXIS_LABEL_OFFSET: 10,
  AXIS_LABEL_BOTTOM_OFFSET: 20,

  // Resize
  RESIZE_DEBOUNCE_MS: 150,

  // Default dimensions
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 400,
} as const;

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Create an SVG `<g>`, translated to (x, y) only when non-zero. */
export function createGroup(x = 0, y = 0): SVGGElement {
  const g = document.createElementNS(SVG_NS, 'g');
  if (x !== 0 || y !== 0) {
    g.setAttribute('transform', `translate(${x}, ${y})`);
  }
  return g;
}
