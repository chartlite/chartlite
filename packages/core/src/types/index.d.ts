export type Theme = 'default' | 'midnight' | 'minimal';

export interface DataPoint {
  x: string | number;
  y: number;
  label?: string;
}

/**
 * Column-oriented data format
 * Example: { x: ['Jan', 'Feb'], y: { revenue: [100, 200], profit: [50, 80] } }
 */
export interface ColumnOrientedData {
  x: (string | number)[];
  y: number[] | Record<string, number[]>;
}

/**
 * Series definition for series-first format
 */
export interface SeriesDefinition {
  name: string;
  dataKey: string;
  type?: 'line' | 'bar' | 'area';
  color?: string;
}

/**
 * Series-first data format
 * Example: { series: [{ name: 'Revenue', dataKey: 'revenue' }], data: [{ month: 'Jan', revenue: 100 }] }
 */
export interface SeriesFirstData {
  series: SeriesDefinition[];
  data: Record<string, any>[];
  xKey?: string; // Optional key for x-axis, defaults to first non-series key
}

/**
 * Flexible data input - supports multiple formats
 */
export type FlexibleDataInput =
  | DataPoint[]                  // Original format: [{ x: 'Jan', y: 30 }]
  | number[]                     // Simple values: [30, 45, 38]
  | ColumnOrientedData           // Column format: { x: [...], y: [...] }
  | SeriesFirstData;             // Series format: { series: [...], data: [...] }

export interface BaseChartConfig {
  /** Chart width in pixels. If not provided, fills container */
  width?: number;
  /** Chart height in pixels. If not provided, fills container */
  height?: number;
  /** Theme preset */
  theme?: Theme;
  /** Custom colors (overrides theme) */
  colors?: string[];
  /** Chart title */
  title?: string;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to animate on initial load */
  animate?: boolean;
  /** Whether to resize chart when container size changes */
  responsive?: boolean;
}

export interface LineChartConfig extends BaseChartConfig {
  data: FlexibleDataInput;
  /** Line curve style */
  curve?: 'linear' | 'smooth';
  /** Show data points */
  showPoints?: boolean;
}

export interface BarChartConfig extends BaseChartConfig {
  data: FlexibleDataInput;
  /** Bar orientation */
  orientation?: 'vertical' | 'horizontal';
}

export interface AreaChartConfig extends BaseChartConfig {
  data: FlexibleDataInput;
  /** Line curve style */
  curve?: 'linear' | 'smooth';
  /** Fill opacity (0-1) */
  fillOpacity?: number;
}

export interface PieChartConfig extends BaseChartConfig {
  data: DataPoint[];
  /** Inner radius for donut chart (0-1) */
  innerRadius?: number;
  /** Show labels */
  showLabels?: boolean;
}

export interface Chart {
  /** Render the chart to the container */
  render(): void;
  /** Update chart data */
  update(data: DataPoint[]): void;
  /** Destroy the chart and cleanup */
  destroy(): void;
  /** Export as SVG string */
  toSVG(): string;
}

export interface Dimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface Scale {
  domain: [number, number] | string[];
  range: [number, number];
}