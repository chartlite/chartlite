/**
 * @chartlite/vue — Vue 3 components for Chartlite.
 *
 * - `<Chart type=… />` — generic, spec-driven (renders any of the 8 chart types).
 * - `<LineChart>`, `<BarChart>`, … — named, per-type, tree-shakeable.
 *
 * Template refs expose `{ chart, error, container, toSVG() }`.
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
export type { ChartInstance, WrapperOptions } from './bridge';
export type { ChartExposed } from './ChartFrame';
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
