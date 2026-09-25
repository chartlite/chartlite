/**
 * Chart overlays: region highlighting, reference lines, and annotations.
 *
 * All three map data values to pixel space using the chart's bounds and the shared
 * linear/band scales, then draw into a dedicated `<g>` layered relative to the data.
 */

import type { BaseChartConfig, Dimensions } from '../types';
import { createLinearScale, createBandScale, type getThemeColors } from '../utils';
import { createGroup, round, sideAlign, svgEl } from './constants';

type ThemeColors = ReturnType<typeof getThemeColors>;

/** Data-space extent of the plotted area, plus optional categorical x values. */
export interface ChartBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xValues?: string[];
}

/** Map an x value to px; categories map to `bandOffset` (0..1) across their band. */
function createXMapper(bounds: ChartBounds, width: number) {
  if (bounds.xValues) {
    const band = createBandScale(bounds.xValues, [0, width], 0);
    return (value: string | number, bandOffset = 0.5): number =>
      band.scale(String(value)) + band.bandwidth * bandOffset;
  }

  const linear = createLinearScale([bounds.xMin, bounds.xMax], [0, width]);
  return (value: string | number): number => linear(Number(value));
}

function readNumericCoordinate(value: string | number, owner: string): number {
  const coordinate = Number(value);
  if (!Number.isFinite(coordinate)) {
    throw new Error(`${owner} must be a finite number`);
  }
  return coordinate;
}

/** A text label; `halo` outlines it in the background color so it stays legible over data. */
function text(
  parent: Element,
  x: number,
  y: number,
  content: string,
  attrs: Record<string, string | number | undefined>,
  halo?: string
): void {
  const el = svgEl('text', {
    x,
    y,
    ...attrs,
    ...(halo && { stroke: halo, 'stroke-width': 3, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }),
  }, parent);
  el.textContent = content;
}

/**
 * Draw the configured regions (behind the data), reference lines, and
 * annotations (above it).
 */
export function renderOverlays(
  svg: SVGSVGElement,
  config: BaseChartConfig,
  dimensions: Dimensions,
  bounds: ChartBounds,
  colors: ThemeColors
): void {
  const { regions, referenceLines, annotations } = config;
  const { margin } = dimensions;
  const w = dimensions.width - margin.left - margin.right;
  const h = dimensions.height - margin.top - margin.bottom;
  const xScale = createXMapper(bounds, w);
  const yScale = createLinearScale([bounds.yMin, bounds.yMax], [h, 0]);
  const group = (className: string): SVGGElement => {
    const g = createGroup(margin.left, margin.top);
    g.classList.add(className);
    return g;
  };

  if (regions?.length) {
    // Insert the regions before the plot so they sit behind the data.
    const g = group('chart-regions');
    svg.insertBefore(g, svg.querySelector('.chart-main'));

    for (const { axis, start, end, label, color = colors.primary, opacity = 0.1, labelPosition = 'middle' } of regions) {
      let x = 0;
      let y = 0;
      let width = w;
      let height = h;
      let labelX = 10;
      let labelY = 15;
      if (axis === 'x') {
        x = xScale(start, 0);
        width = xScale(end, 1) - x;
        labelX = labelPosition === 'start' ? x + 5 : labelPosition === 'end' ? x + width - 5 : x + width / 2;
      } else {
        const startY = yScale(readNumericCoordinate(start, 'Region start'));
        y = yScale(readNumericCoordinate(end, 'Region end'));
        height = startY - y;
        labelY = labelPosition === 'start' ? startY - 5 : labelPosition === 'end' ? y + 15 : y + height / 2;
      }
      svgEl('rect', { x, y, width, height, fill: color, opacity }, g);
      if (label) {
        text(g, labelX, labelY, label, {
          'text-anchor': axis === 'x' ? 'middle' : 'start',
          fill: color,
          'font-size': 11,
          'font-weight': 600,
        });
      }
    }
  }

  if (referenceLines?.length) {
    const g = group('chart-reference-lines');
    svg.appendChild(g);

    for (const line of referenceLines) {
      const { axis, value, label, color = colors.text, style = 'dashed', strokeWidth = 1.5, labelPosition = 'end' } = line;
      const horizontal = axis === 'y';
      const at = horizontal ? yScale(readNumericCoordinate(value, 'Reference line value')) : xScale(value);
      svgEl('line', {
        x1: horizontal ? 0 : at,
        y1: horizontal ? at : 0,
        x2: horizontal ? w : at,
        y2: horizontal ? at : h,
        stroke: color,
        'stroke-width': strokeWidth,
        // The default (theme text) color is muted so the line reads as a guide.
        'stroke-opacity': line.color ? undefined : 0.5,
        'stroke-dasharray': style === 'dashed' ? '4 3' : style === 'dotted' ? '2 2' : undefined,
      }, g);

      if (label) {
        // Horizontal lines: label above the line at the start/middle/end.
        // Vertical lines: label right of the line at the top/middle/bottom.
        const place = labelPosition === 'start' ? 0 : labelPosition === 'middle' ? 1 : 2;
        text(
          g,
          horizontal ? [5, w / 2, w - 5][place] : at + 5,
          horizontal ? at - 5 : [15, h / 2, h - 5][place],
          label,
          {
            'text-anchor': horizontal ? ['start', 'middle', 'end'][place] : 'start',
            fill: color,
            'font-size': 11,
            'font-weight': 500,
          },
          colors.background
        );
      }
    }
  }

  if (annotations?.length) {
    const g = group('chart-annotations');
    svg.appendChild(g);

    for (const annotation of annotations) {
      const {
        text: content,
        color = colors.text,
        fontSize = 12,
        fontWeight = 'normal',
        showArrow = false,
        arrowColor = color,
        offset = {},
        anchor = 'top',
      } = annotation;
      const pointX = xScale(annotation.x);
      const pointY = yScale(annotation.y);

      // The anchor names the side of the point the text sits on, 15px away.
      const dx = anchor.includes('left') ? -1 : anchor.includes('right') ? 1 : 0;
      const dy = anchor.startsWith('top') ? -1 : anchor.startsWith('bottom') ? 1 : 0;
      const textX = pointX + (offset.x || 0) + dx * 15;
      const textY = pointY + (offset.y || 0) + dy * 15;

      if (showArrow) {
        svgEl('line', {
          x1: pointX,
          y1: pointY,
          x2: textX,
          y2: textY,
          stroke: arrowColor,
          'stroke-width': 1,
          opacity: 0.6,
        }, g);

        // Arrowhead at the data point, pointing away from the text.
        const angle = Math.atan2(textY - pointY, textX - pointX);
        const corner = (turn: number): string =>
          `${round(pointX - 5 * Math.cos(angle + turn))},${round(pointY - 5 * Math.sin(angle + turn))}`;
        svgEl('polygon', {
          points: `${round(pointX)},${round(pointY)} ${corner(-Math.PI / 6)} ${corner(Math.PI / 6)}`,
          fill: arrowColor,
          opacity: 0.6,
        }, g);
      }

      text(
        g,
        textX,
        textY,
        content,
        {
          ...sideAlign(dx, dy),
          fill: color,
          'font-size': fontSize,
          'font-weight': fontWeight,
        },
        colors.background
      );
    }
  }
}
