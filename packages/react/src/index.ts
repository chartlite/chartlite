/**
 * chartlite React
 * React components for chartlite
 */

export { LineChart } from './charts/LineChart';
export { BarChart } from './charts/BarChart';
export { AreaChart } from './charts/AreaChart';

// Re-export types from core
export type {
  Theme,
  DataPoint,
  SeriesDefinition,
  SeriesFirstData,
  ColumnOrientedData,
  FlexibleDataInput,
  BaseChartConfig,
  LineChartConfig,
  BarChartConfig,
  AreaChartConfig,
  PieChartConfig,
  LegendPosition,
  LegendConfig,
} from '@chartlite/core';