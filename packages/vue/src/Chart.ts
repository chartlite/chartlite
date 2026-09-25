import { defineComponent } from 'vue';
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
import type { ChartConstructor, CoreConfig } from './bridge';
import { chartSetup } from './ChartFrame';
import { genericProps } from './props';
import type { ChartConfigByType, ChartType } from './useChart';

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

function lookup(type: string | undefined): ChartConstructor<CoreConfig> | undefined {
  if (type === undefined || !Object.prototype.hasOwnProperty.call(REGISTRY, type)) return undefined;
  // SAFETY: `type` is an own key of REGISTRY (checked above); the discriminator
  // selects the matching constructor for the options bound alongside it.
  return REGISTRY[type as ChartType] as ChartConstructor<CoreConfig>;
}

/**
 * Generic, spec-driven chart. Bind a `type` plus any Chartlite config — the Vue
 * mirror of the core's `renderToString(spec)`:
 *
 * ```vue
 * <Chart type="combo" :data="spec.data" theme="tailwind" />
 * <Chart v-bind="spec" />
 * ```
 */
export const Chart = /* @__PURE__ */ defineComponent({
  name: 'Chart',
  inheritAttrs: false,
  props: genericProps(),
  setup: /* @__PURE__ */ chartSetup(lookup, true),
});
