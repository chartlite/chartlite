/**
 * Accessibility text generation.
 *
 * Pure functions that build the ARIA label, screen-reader description, and the
 * hidden data-table fallback from chart data. Extracted from BaseChart so the
 * logic is unit-testable in isolation and free of DOM/`this` coupling.
 */

import type { DataPoint, SeriesData } from '../types';

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

  const allYValues = seriesData.flatMap((s) => s.data.map((d) => d.y));
  const min = Math.min(...allYValues);
  const max = Math.max(...allYValues);

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

  if (seriesData.length === 1) {
    // Single series table
    const rows = data
      .map((point) => `<tr><td>${point.x}</td><td>${point.y}</td></tr>`)
      .join('');

    return `
        <table class="sr-only" aria-label="Chart data table">
          <caption>${title} - Data Table</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
  }

  // Multi-series table
  const seriesHeaders = seriesData
    .map((s) => `<th scope="col">${s.name}</th>`)
    .join('');

  // Get all unique x values
  const allXValues = Array.from(
    new Set(seriesData.flatMap((s) => s.data.map((d) => String(d.x))))
  );

  const rows = allXValues
    .map((x) => {
      const cells = seriesData
        .map((series) => {
          const point = series.data.find((d) => String(d.x) === x);
          return `<td>${point ? point.y : '-'}</td>`;
        })
        .join('');

      return `<tr><th scope="row">${x}</th>${cells}</tr>`;
    })
    .join('');

  return `
        <table class="sr-only" aria-label="Chart data table">
          <caption>${title} - Data Table</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              ${seriesHeaders}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
}
