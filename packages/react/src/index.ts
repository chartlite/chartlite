/**
 * @chartlite/react — React components for Chartlite.
 *
 * - `<Chart type=… />` — generic, spec-driven (renders any of the 8 chart types).
 * - `<LineChart>`, `<BarChart>`, … — named, per-type, tree-shakeable.
 *
 * Every component forwards a `ref` to a {@link ChartHandle}.
 */

export { Chart, type ChartType, type ChartProps, type ChartSpecProps } from './Chart';
export {
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  PieChart,
  RadialChart,
  ComboChart,
  Sparkline,
  type LineChartProps,
  type BarChartProps,
  type AreaChartProps,
  type ScatterChartProps,
  type PieChartProps,
  type RadialChartProps,
  type ComboChartProps,
  type SparklineProps,
} from './charts';
export type {
  ChartFrameOwnProps,
  ChartContainerAttributes,
  ChartComponentProps,
  ChartHandle,
} from './ChartFrame';
export type { ChartInstance, WrapperOptions } from './bridge';
export type { TooltipOptions } from '@chartlite/core/interactive';

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
  ChartPlugin,
} from '@chartlite/core';
