/**
 * @chartlite/react — React components for Chartlite.
 *
 * - `<Chart type=… />` — generic, spec-driven (renders any of the 9 chart types).
 * - `<LineChart>`, `<BarChart>`, … — named, per-type, tree-shakeable.
 */

export { Chart, type ChartType } from './Chart';
export {
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  PieChart,
  RadialChart,
  ComboChart,
  Sparkline,
} from './charts';
export type { ChartFrameOwnProps } from './ChartFrame';

// Re-export config + data types from core so consumers get full typing.
export type {
  Theme,
  DataPoint,
  SeriesDefinition,
  SeriesFirstData,
  ColumnOrientedData,
  FlexibleDataInput,
  SeriesData,
  BaseChartConfig,
  LineChartConfig,
  BarChartConfig,
  AreaChartConfig,
  PieChartConfig,
  RadialChartConfig,
  ComboChartConfig,
  ScatterChartConfig,
  SparklineConfig,
  LegendPosition,
  LegendAlign,
  LegendConfig,
  ReferenceLine,
  Annotation,
  Region,
  ChartPointEvent,
  LegendToggleEvent,
} from '@chartlite/core';
