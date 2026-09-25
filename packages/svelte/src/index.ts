/**
 * @chartlite/svelte — a Svelte action for Chartlite.
 *
 * `use:chart={{ type, ...config }}` renders any of the 8 chart types into the
 * host element. Data-only param changes call `chart.update(data)`, other option
 * changes recreate the chart, and it is destroyed on unmount.
 */

export {
  chart,
  type ChartType,
  type ChartParams,
  type ChartSpecParams,
  type ActionReturn,
} from './action';
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
