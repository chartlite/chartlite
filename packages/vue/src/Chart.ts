import {
  LineChart as CoreLine,
  BarChart as CoreBar,
  AreaChart as CoreArea,
  ScatterChart as CoreScatter,
  PieChart as CorePie,
  RadialChart as CoreRadial,
  ComboChart as CoreCombo,
  Sparkline as CoreSparkline,
} from '@chartlite/core';
import { defineChartComponent } from './ChartFrame';
import type { ChartConstructor } from './useChart';

/** Every chart type the generic `<Chart>` can render. */
export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'scatter'
  | 'pie'
  | 'radial'
  | 'combo'
  | 'sparkline';

const REGISTRY: Record<ChartType, ChartConstructor> = {
  line: CoreLine as unknown as ChartConstructor,
  bar: CoreBar as unknown as ChartConstructor,
  area: CoreArea as unknown as ChartConstructor,
  scatter: CoreScatter as unknown as ChartConstructor,
  pie: CorePie as unknown as ChartConstructor,
  radial: CoreRadial as unknown as ChartConstructor,
  combo: CoreCombo as unknown as ChartConstructor,
  sparkline: CoreSparkline as unknown as ChartConstructor,
};

/**
 * Generic, spec-driven chart. Bind a `type` plus any Chartlite config as
 * attributes — the Vue mirror of the core's `renderToString(spec)`:
 *
 * ```vue
 * <Chart type="combo" :data="spec.data" theme="tailwind" />
 * ```
 */
export const Chart = defineChartComponent('Chart', (attrs) => {
  const type = attrs.type as ChartType | undefined;
  return type ? REGISTRY[type] : undefined;
});
