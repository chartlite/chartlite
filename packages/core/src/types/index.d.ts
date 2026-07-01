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

/**
 * Internal series data structure after normalization
 */
export interface SeriesData {
  name: string;
  color?: string;
  data: DataPoint[];
}

/**
 * Legend position options
 */
export type LegendPosition = 'top' | 'bottom';

/**
 * Legend horizontal alignment (for top/bottom positions) */
export type LegendAlign = 'left' | 'center' | 'right';

/**
 * Legend configuration
 */
export interface LegendConfig {
  show?: boolean;
  position?: LegendPosition;
  layout?: 'horizontal' | 'vertical';
  align?: LegendAlign;
}

/**
 * Reference line configuration
 * Draws horizontal or vertical lines at specific values
 */
export interface ReferenceLine {
  /** Axis to draw the line on */
  axis: 'x' | 'y';
  /** Value on the axis where the line should be drawn */
  value: number | string;
  /** Line label */
  label?: string;
  /** Line color (defaults to theme grid color) */
  color?: string;
  /** Line style */
  style?: 'solid' | 'dashed' | 'dotted';
  /** Line width in pixels (default: 2) */
  strokeWidth?: number;
  /** Label position along the line */
  labelPosition?: 'start' | 'middle' | 'end';
}

/**
 * Annotation configuration
 * Adds text annotations with optional arrows to specific points
 */
export interface Annotation {
  /** X coordinate (data value or pixel position) */
  x: number | string;
  /** Y coordinate (data value or pixel position) */
  y: number;
  /** Annotation text */
  text: string;
  /** Text color (defaults to theme text color) */
  color?: string;
  /** Font size in pixels (default: 12) */
  fontSize?: number;
  /** Font weight (default: 'normal') */
  fontWeight?: 'normal' | 'bold' | '500' | '600' | '700';
  /** Show arrow pointing to the data point */
  showArrow?: boolean;
  /** Arrow color (defaults to annotation color) */
  arrowColor?: string;
  /** Text offset from point in pixels (default: 10) */
  offset?: { x?: number; y?: number };
  /** Anchor position relative to the point */
  anchor?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Region highlighting configuration
 * Highlights specific ranges on the chart
 */
export interface Region {
  /** Axis to highlight (x for vertical region, y for horizontal region) */
  axis: 'x' | 'y';
  /** Start value of the region */
  start: number | string;
  /** End value of the region */
  end: number | string;
  /** Region label */
  label?: string;
  /** Fill color (defaults to theme primary with low opacity) */
  color?: string;
  /** Fill opacity (default: 0.1) */
  opacity?: number;
  /** Label position */
  labelPosition?: 'start' | 'middle' | 'end';
}

/**
 * Note: All performance optimizations are now automatic and handled internally.
 * No configuration needed - charts are fast by default!
 */

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
  /** Whether to show legend (deprecated: use legend.show) */
  showLegend?: boolean;
  /** Legend configuration */
  legend?: LegendConfig;
  /** Whether to animate on initial load (animations are disabled by default for performance) */
  animate?: boolean;
  /** Whether to resize chart when container size changes */
  responsive?: boolean;
  /** Reference lines to draw on the chart */
  referenceLines?: ReferenceLine[];
  /** Annotations to add to the chart */
  annotations?: Annotation[];
  /** Regions to highlight on the chart */
  regions?: Region[];
  /** Plugins to extend chart functionality */
  plugins?: ChartPlugin[];
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

export interface ScatterChartConfig extends BaseChartConfig {
  data: FlexibleDataInput;
  /** Point size in pixels (default: 6) */
  pointSize?: number;
  /** Show labels for data points */
  showLabels?: boolean;
  /** Label offset from point in pixels (default: 10) */
  labelOffset?: number;
  /** Label position relative to point */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** Point shape */
  pointShape?: 'circle' | 'square' | 'triangle';
}

export interface Chart {
  /** Render the chart to the container */
  render(): void;
  /** Update chart data */
  update(data: DataPoint[] | FlexibleDataInput): void;
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

/**
 * Plugin system
 */

/** Plugin lifecycle hooks */
export interface ChartPlugin {
  /** Unique plugin identifier */
  name: string;

  /** Called before the chart is first rendered */
  beforeRender?(context: PluginContext): void;

  /** Called after the chart is first rendered */
  afterRender?(context: PluginContext): void;

  /** Called before the chart is updated with new data */
  beforeUpdate?(context: PluginContext): void;

  /** Called after the chart is updated with new data */
  afterUpdate?(context: PluginContext): void;

  /** Called before the chart is destroyed */
  beforeDestroy?(context: PluginContext): void;

  /** Called when chart is resized */
  onResize?(context: PluginContext): void;
}

/** Context provided to plugins */
export interface PluginContext {
  /** The chart instance */
  chart: Chart;

  /** The SVG element (may be null before render) */
  svg: SVGSVGElement | null;

  /** The chart configuration */
  config: BaseChartConfig;

  /** The normalized chart data */
  data: DataPoint[] | SeriesData[];

  /** Chart dimensions */
  dimensions: Dimensions;

  /** The container element */
  container: HTMLElement;

  /** Helper to create SVG elements */
  createSVGElement<K extends keyof SVGElementTagNameMap>(
    tagName: K,
    attributes?: Record<string, string | number>
  ): SVGElementTagNameMap[K];

  /** Helper to emit custom events */
  emit(eventName: string, data?: any): void;

  /** Helper to listen to custom events */
  on(eventName: string, handler: (data?: any) => void): void;

  /** Helper to remove event listener */
  off(eventName: string, handler: (data?: any) => void): void;
}