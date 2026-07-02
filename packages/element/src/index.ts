/**
 * @chartlite/element — the `<chart-lite>` web component.
 *
 * Importing this module auto-registers `<chart-lite>`. For a custom tag name,
 * import `{ defineChartElement }` and call it yourself.
 */

import { defineChartElement } from './ChartLiteElement';

export { ChartLiteElement, defineChartElement, type ChartType } from './ChartLiteElement';

// Auto-register on import (the common case: `import '@chartlite/element'`).
defineChartElement();

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
