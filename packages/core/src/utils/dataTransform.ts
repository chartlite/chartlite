/**
 * Data transformation utilities
 * Converts various data formats into normalized DataPoint[] or SeriesData[]
 */

import type {
  DataPoint,
  FlexibleDataInput,
  ColumnOrientedData,
  SeriesFirstData,
  SeriesData,
  SeriesDefinition,
} from '../types';

/**
 * Check if data is in column-oriented format
 */
function isColumnOrientedData(data: any): data is ColumnOrientedData {
  return (
    data &&
    typeof data === 'object' &&
    'x' in data &&
    'y' in data &&
    Array.isArray(data.x) &&
    (Array.isArray(data.y) || typeof data.y === 'object')
  );
}

/**
 * Check if data is in series-first format
 */
function isSeriesFirstData(data: any): data is SeriesFirstData {
  return (
    data &&
    typeof data === 'object' &&
    'series' in data &&
    'data' in data &&
    Array.isArray(data.series) &&
    Array.isArray(data.data)
  );
}

/**
 * Check if data is a simple array of numbers
 */
function isNumberArray(data: any): data is number[] {
  return Array.isArray(data) && data.length > 0 && typeof data[0] === 'number';
}

/**
 * Check if data is already in DataPoint[] format
 */
function isDataPointArray(data: any): data is DataPoint[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    'x' in data[0] &&
    'y' in data[0]
  );
}

/**
 * Convert column-oriented data to DataPoint[]
 */
function convertColumnOrientedData(data: ColumnOrientedData): DataPoint[] {
  const { x, y } = data;

  // If y is a simple array
  if (Array.isArray(y)) {
    return x.map((xVal, i) => ({
      x: xVal,
      y: y[i],
    }));
  }

  // If y is an object with multiple series, take the first series
  // (For single-series charts, we'll just use the first data series)
  const firstSeriesKey = Object.keys(y)[0];
  const values = y[firstSeriesKey];

  return x.map((xVal, i) => ({
    x: xVal,
    y: values[i],
  }));
}

/**
 * Convert series-first data to DataPoint[]
 * For single-series charts, uses the first series
 */
function convertSeriesFirstData(data: SeriesFirstData): DataPoint[] {
  const { series, data: records, xKey } = data;

  if (series.length === 0 || records.length === 0) {
    return [];
  }

  // Determine the x-axis key
  const firstRecord = records[0];
  const allKeys = Object.keys(firstRecord);
  const dataKeys = series.map(s => s.dataKey);

  // Find x-axis key: use xKey if provided, otherwise first non-series key
  const xAxisKey = xKey || allKeys.find(key => !dataKeys.includes(key)) || allKeys[0];

  // For single-series charts, use the first series
  const firstSeries = series[0];

  return records.map(record => ({
    x: record[xAxisKey],
    y: record[firstSeries.dataKey],
  }));
}

/**
 * Convert simple number array to DataPoint[]
 */
function convertNumberArray(data: number[]): DataPoint[] {
  return data.map((value, index) => ({
    x: index,
    y: value,
  }));
}

/**
 * Normalize any supported data format into DataPoint[]
 */
export function normalizeData(data: FlexibleDataInput): DataPoint[] {
  // Already in correct format
  if (isDataPointArray(data)) {
    return data;
  }

  // Simple number array
  if (isNumberArray(data)) {
    return convertNumberArray(data);
  }

  // Column-oriented format
  if (isColumnOrientedData(data)) {
    return convertColumnOrientedData(data);
  }

  // Series-first format
  if (isSeriesFirstData(data)) {
    return convertSeriesFirstData(data);
  }

  // Fallback: try to treat as DataPoint[]
  return data as DataPoint[];
}

/**
 * Extract color from series-first data if available
 */
export function extractColorsFromSeriesData(data: FlexibleDataInput): string[] | undefined {
  if (isSeriesFirstData(data)) {
    const colors = data.series
      .map(s => s.color)
      .filter((color): color is string => !!color);

    return colors.length > 0 ? colors : undefined;
  }
  return undefined;
}

/**
 * Check if data format supports multi-series
 */
export function isMultiSeriesData(data: FlexibleDataInput): boolean {
  if (isSeriesFirstData(data)) {
    return data.series.length > 1;
  }

  if (isColumnOrientedData(data)) {
    return typeof data.y === 'object' && !Array.isArray(data.y);
  }

  return false;
}

/**
 * Extract series definitions from data
 * Returns undefined for single-series data
 */
export function extractSeriesDefinitions(data: FlexibleDataInput): SeriesDefinition[] | undefined {
  if (isSeriesFirstData(data)) {
    return data.series;
  }

  if (isColumnOrientedData(data) && typeof data.y === 'object' && !Array.isArray(data.y)) {
    // Convert column-oriented multi-series to SeriesDefinition[]
    return Object.keys(data.y).map((key) => ({
      name: key,
      dataKey: key,
    }));
  }

  return undefined;
}

/**
 * Normalize multi-series data to SeriesData[]
 */
export function normalizeToSeriesData(
  data: FlexibleDataInput,
  seriesDefinitions?: SeriesDefinition[]
): SeriesData[] {
  // Series-first format
  if (isSeriesFirstData(data)) {
    const { series, data: records, xKey } = data;

    // Determine the x-axis key
    const firstRecord = records[0];
    const allKeys = Object.keys(firstRecord);
    const dataKeys = series.map(s => s.dataKey);
    const xAxisKey = xKey || allKeys.find(key => !dataKeys.includes(key)) || allKeys[0];

    return series.map(s => ({
      name: s.name,
      color: s.color,
      data: records.map(record => ({
        x: record[xAxisKey],
        y: record[s.dataKey],
      })),
    }));
  }

  // Column-oriented format with multiple series
  if (isColumnOrientedData(data) && typeof data.y === 'object' && !Array.isArray(data.y)) {
    const { x, y } = data;
    const seriesKeys = Object.keys(y);

    return seriesKeys.map((key, index) => {
      const values = y[key];
      const definition = seriesDefinitions?.[index];

      return {
        name: definition?.name || key,
        color: definition?.color,
        data: x.map((xVal, i) => ({
          x: xVal,
          y: values[i],
        })),
      };
    });
  }

  // Single-series data: wrap in SeriesData array
  const normalized = normalizeData(data);
  return [{
    name: 'Series 1',
    data: normalized,
  }];
}

/**
 * Get all unique x-axis values from multi-series data
 */
export function getAllXValues(seriesData: SeriesData[]): (string | number)[] {
  const xValuesSet = new Set<string | number>();

  seriesData.forEach(series => {
    series.data.forEach(point => {
      xValuesSet.add(point.x);
    });
  });

  return Array.from(xValuesSet);
}

/**
 * Get combined y-axis range from multi-series data
 */
export function getCombinedYRange(seriesData: SeriesData[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  seriesData.forEach(series => {
    series.data.forEach(point => {
      if (point.y < min) min = point.y;
      if (point.y > max) max = point.y;
    });
  });

  // Include 0 in the range
  min = Math.min(min, 0);
  max = Math.max(max, 0);

  return { min, max };
}
