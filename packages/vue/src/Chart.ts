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
import type {
  ChartConfigByType,
  ChartConfig,
  ChartConstructor,
  ChartType,
} from './useChart';

export type { ChartType } from './useChart';

/** Every chart type the generic `<Chart>` can render. */
const REGISTRY = {
  line: CoreLine,
  bar: CoreBar,
  area: CoreArea,
  scatter: CoreScatter,
  pie: CorePie,
  radial: CoreRadial,
  combo: CoreCombo,
  sparkline: CoreSparkline,
} satisfies { [K in ChartType]: ChartConstructor<ChartConfigByType[K]> };

/**
 * Generic, spec-driven chart. Bind a `type` plus any Chartlite config as
 * attributes — the Vue mirror of the core's `renderToString(spec)`:
 *
 * ```vue
 * <Chart type="combo" :data="spec.data" theme="tailwind" />
 * ```
 */
export const Chart = /* @__PURE__ */ defineChartComponent('Chart', (attrs) => {
  const type = attrs.type;
  if (!type) return undefined;
  // SAFETY: the discriminator selects the matching constructor; Vue fall-through
  // attrs cannot express this per-key generic relationship in the component type.
  return REGISTRY[type] as ChartConstructor<ChartConfig>;
});
