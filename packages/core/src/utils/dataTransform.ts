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
  SeriesFirstRecord,
} from '../types';

const isFiniteNumber = (value: any): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isXValue = (value: any): value is string | number =>
  typeof value === 'string' || isFiniteNumber(value);

const isSeriesDefinition = (value: any): value is SeriesDefinition =>
  Boolean(value) &&
  typeof value === 'object' &&
  typeof value.name === 'string' &&
  typeof value.dataKey === 'string' &&
  (value.type === undefined || ['line', 'bar', 'area'].includes(value.type)) &&
  (value.color === undefined || typeof value.color === 'string');

const isSeriesRecord = (value: any): value is SeriesFirstRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isDataPoint = (value: any): value is DataPoint =>
  Boolean(value) &&
  typeof value === 'object' &&
  isXValue(value.x) &&
  isFiniteNumber(value.y) &&
  (value.label === undefined || typeof value.label === 'string');

/**
 * Check if data is in column-oriented format
 */
function isColumnOrientedData(data: any): data is ColumnOrientedData {
  if (!data || typeof data !== 'object' || !Array.isArray(data.x) || !data.x.length) return false;
  if (!data.x.every(isXValue)) return false;

  // Single series: y is number[]
  if (Array.isArray(data.y)) {
    // Validate arrays have same length
    if (data.x.length !== data.y.length) return false;
    // Validate all y values are numbers
    return data.y.every(isFiniteNumber);
  }

  // Multi-series: y is Record<string, number[]>
  if (data.y !== null && typeof data.y === 'object' && !Array.isArray(data.y)) {
    return Object.values(data.y).every((values: any) =>
      Array.isArray(values) && values.length === data.x.length && values.every(isFiniteNumber)
    );
  }

  return false;
}

/**
 * Check if data is in series-first format
 */
function isSeriesFirstData(data: any): data is SeriesFirstData {
  if (!data || typeof data !== 'object' || !Array.isArray(data.series) || !Array.isArray(data.data)) return false;

  // Must have at least one series
  if (data.series.length === 0 || data.data.length === 0) {
    throw new Error('Chart data cannot be empty');
  }

  // Validate series definitions and every record. Series-first input commonly
  // arrives from JSON, so the TypeScript shape alone is not a runtime guarantee.
  const validSeries = data.series.every(isSeriesDefinition);
  if (!validSeries || (data.xKey !== undefined && typeof data.xKey !== 'string')) return false;

  if (!data.data.every(isSeriesRecord)) return false;
  const firstRecord = data.data[0];
  const dataKeys = data.series.map((series: SeriesDefinition) => series.dataKey);
  const xAxisKey = data.xKey || Object.keys(firstRecord).find((key) => !dataKeys.includes(key)) || Object.keys(firstRecord)[0];

  return data.data.every((record: SeriesFirstRecord) => {
    const x = record[xAxisKey];
    if (!isXValue(x)) return false;
    return dataKeys.every((key: string) =>
      record[key] === undefined ||
      isFiniteNumber(record[key])
    );
  });
}

/**
 * Check if data is a simple array of numbers
 */
function isNumberArray(data: any): data is number[] {
  return Array.isArray(data) && data.every(isFiniteNumber);
}

/**
 * Check if data is already in DataPoint[] format
 */
function isDataPointArray(data: any): data is DataPoint[] {
  return Array.isArray(data) && data.every(isDataPoint);
}

function readSeriesX(record: SeriesFirstRecord, key: string): string | number {
  const value = record[key];
  if (!isXValue(value)) throw new Error(`Invalid x value for series key "${key}"`);
  return value;
}

function readSeriesY(record: SeriesFirstRecord, key: string): number {
  const value = record[key];
  if (value === undefined) return 0;
  if (!isFiniteNumber(value)) throw new Error(`Invalid y value for series key "${key}"`);
  return value;
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
    x: readSeriesX(record, xAxisKey),
    y: readSeriesY(record, firstSeries.dataKey),
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
  if (Array.isArray(data) && !data.length) throw new Error('Chart data cannot be empty');
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

  // Invalid data format
  throw new Error('Invalid data format');
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
    return !Array.isArray(data.y);
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

  if (isColumnOrientedData(data) && !Array.isArray(data.y)) {
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
      type: s.type,
      data: records.map(record => ({
        x: readSeriesX(record, xAxisKey),
        y: readSeriesY(record, s.dataKey),
      })),
    }));
  }

  // Column-oriented formats
  if (isColumnOrientedData(data)) {
    const { x, y } = data;
    if (Array.isArray(y)) {
      return [{ name: 'Series 1', data: convertColumnOrientedData(data) }];
    }
    const seriesKeys = Object.keys(y);

    return seriesKeys.map((key, index) => {
      const values = y[key];
      const definition = seriesDefinitions?.[index];

      return {
        name: definition?.name || key,
        color: definition?.color,
        type: definition?.type,
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
  // Every categorical chart ultimately renders x values as strings. Keying this
  // map the same way prevents `1` and `'1'` from creating duplicate, overlapping
  // bands while preserving the first source value for numeric scatter charts.
  const xValues = new Map<string, string | number>();

  seriesData.forEach(series => {
    series.data.forEach(point => {
      const key = String(point.x);
      if (!xValues.has(key)) xValues.set(key, point.x);
    });
  });

  return Array.from(xValues.values());
}

/**
 * Get combined y-axis range from multi-series data
 */
export interface NumericRange {
  min: number;
  max: number;
}

export function getCombinedYRange(seriesData: SeriesData[]): NumericRange {
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

  // All-zero data otherwise produces a zero-width scale and NaN coordinates.
  if (min === max) max = min + 1;

  return { min, max };
}
