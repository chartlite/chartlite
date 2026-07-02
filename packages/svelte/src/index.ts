/**
 * @chartlite/svelte — a Svelte action for Chartlite.
 *
 * `use:chart={{ type, ...config }}` renders any of the 8 chart types into the
 * host element, recreating on param change and destroying on unmount.
 */

export { chart, type ChartType, type ChartParams, type ActionReturn } from './action';

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
  LegendConfig,
  ReferenceLine,
  Annotation,
  Region,
  ChartPointEvent,
  LegendToggleEvent,
} from '@chartlite/core';
