/**
 * Accessibility text generation.
 *
 * Pure functions that build the ARIA label, screen-reader description, and the
 * hidden data-table fallback from chart data. Extracted from BaseChart so the
 * logic is unit-testable in isolation and free of DOM/`this` coupling.
 */

import type { DataPoint, SeriesData } from '../types';

const HTML_ENTITIES = new Map<string, string>([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#39;'],
]);

function escapeHTML(value: string | number): string {
  return String(value).replace(
    /[&<>"']/g,
    (character) => HTML_ENTITIES.get(character) ?? character
  );
}

/** Fallback title used when the user doesn't supply one (e.g. "Line Chart"). */
export function generateDefaultTitle(chartTypeName: string): string {
  return `${chartTypeName} Chart`;
}

/**
 * Describe the overall direction of a single series from first to last point.
 * Returns an empty string when there isn't enough signal to call a trend.
 */
export function calculateTrend(data: DataPoint[]): string {
  if (data.length < 2) return '';

  const first = data[0].y;
  const last = data[data.length - 1].y;

  if (first === 0) return '';

  const change = ((last - first) / Math.abs(first)) * 100;

  if (change > 10) return 'strong upward';
  if (change > 2) return 'slight upward';
  if (change < -10) return 'strong downward';
  if (change < -2) return 'slight downward';
  return 'relatively flat';
}

/** Short label announced by screen readers for the chart as a whole. */
export function generateAriaLabel(params: {
  chartTypeName: string;
  title?: string;
  data: DataPoint[];
  seriesData: SeriesData[];
}): string {
  const chartType = params.chartTypeName.toLowerCase();
  const title = params.title || 'Untitled chart';
  const seriesCount = params.seriesData.length;
  const totalPoints = params.seriesData.reduce((sum, s) => sum + s.data.length, 0);

  if (seriesCount > 1) {
    return `${chartType} chart: ${title} with ${seriesCount} data series and ${totalPoints} total data points`;
  }
  return `${chartType} chart: ${title} with ${params.data.length} data points`;
}

/** Longer prose description (SVG `<desc>`) summarizing range and trend. */
export function generateDescription(params: {
  chartTypeName: string;
  data: DataPoint[];
  seriesData: SeriesData[];
}): string {
  const chartType = params.chartTypeName.toLowerCase();
  const { data, seriesData } = params;

  if (data.length === 0) {
    return `Empty ${chartType} chart with no data.`;
  }

  let min = Infinity;
  let max = -Infinity;
  seriesData.forEach((series) => series.data.forEach((point) => {
    if (point.y < min) min = point.y;
    if (point.y > max) max = point.y;
  }));

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const trend = calculateTrend(data);

  let description = `${chartType} chart showing data from ${firstPoint.x} to ${lastPoint.x}. `;
  description += `Values range from ${min.toFixed(2)} to ${max.toFixed(2)}`;

  if (trend) {
    description += `, with a ${trend} trend`;
  }

  if (seriesData.length > 1) {
    description += `. Chart contains ${seriesData.length} data series: ${seriesData
      .map((s) => s.name)
      .join(', ')}`;
  }

  description += '.';
  return description;
}

/** HTML data table (visually hidden) that screen-reader users can navigate. */
export function generateDataTableHTML(params: {
  title: string;
  data: DataPoint[];
  seriesData: SeriesData[];
}): string {
  const { title, data, seriesData } = params;
  let headers: string;
  let rows: string;

  if (seriesData.length === 1) {
    headers = '<th scope="col">Value</th>';
    rows = data
      .map((point) => `<tr><td>${escapeHTML(point.x)}</td><td>${escapeHTML(point.y)}</td></tr>`)
      .join('');
  } else {
    headers = seriesData.map((s) => `<th scope="col">${escapeHTML(s.name)}</th>`).join('');
    const xValues = Array.from(new Set(seriesData.flatMap((s) => s.data.map((d) => String(d.x)))));
    const valueMaps = seriesData.map((series) =>
      new Map(series.data.map((point) => [String(point.x), point.y]))
    );
    rows = xValues.map((x) => {
      const cells = valueMaps.map((values) => {
        const value = values.get(x);
        return `<td>${value === undefined ? '-' : escapeHTML(value)}</td>`;
      }).join('');
      return `<tr><th scope="row">${escapeHTML(x)}</th>${cells}</tr>`;
    }).join('');
  }

  return `<table class="sr-only" aria-label="Chart data table"><caption>${escapeHTML(title)} - Data Table</caption><thead><tr><th scope="col">Category</th>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}
