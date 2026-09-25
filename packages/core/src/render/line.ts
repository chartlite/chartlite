/** Line series drawing, shared by LineChart and ComboChart. */

import type { SeriesData } from '../types';
import type { Plot } from '../charts/BaseChart';
import { generateLinePath } from '../utils';
import { markDataPoint, setSeriesAttrs } from './dataAttrs';
import { svgEl } from './constants';

/** Above this many points per series, markers are hidden by default. */
export const AUTO_POINTS_LIMIT = 24;

export interface LineStyle {
  color: string;
  /** Marker outline (the chart background). */
  background: string;
  curve?: 'linear' | 'smooth';
  showPoints: boolean;
  /** Prefix aria labels with the series name. */
  multi: boolean;
}

/**
 * Draw one line series into `plot`: the stroke (tagged for legend toggling),
 * then a focusable, hoverable mark per point. With `showPoints` off the marks
 * are transparent hit targets, so tooltips and keyboard nav still work.
 * `under` runs before the stroke is drawn, e.g. to fill the area beneath it.
 */
export function drawLineSeries(
  plot: Plot,
  series: SeriesData,
  seriesIndex: number,
  style: LineStyle,
  under?: (d: string, points: Array<{ x: number; y: number }>) => void
): SVGPathElement {
  const { color, showPoints } = style;
  const points = series.data.map((d) => ({ x: plot.x(d.x) + plot.bw / 2, y: plot.y(d.y) }));
  const d = generateLinePath(points, style.curve);
  under?.(d, points);

  const path = svgEl('path', {
    d,
    fill: 'none',
    stroke: color,
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }, plot.g);
  setSeriesAttrs(path, seriesIndex, series.name);

  series.data.forEach((point, index) => {
    const { x, y } = points[index];
    const circle = svgEl('circle', showPoints
      ? { cx: x, cy: y, r: 3.5, fill: color, stroke: style.background, 'stroke-width': 1.5 }
      : { cx: x, cy: y, r: 6, fill: 'transparent' }, plot.g);
    markDataPoint(
      circle, `${style.multi ? `${series.name}, ` : ''}Data point: ${point.x}, value ${point.y}`,
      point.x, point.y, series.name, seriesIndex, index, x, y
    );
  });
  return path;
}
