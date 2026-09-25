/**
 * Named, per-type Vue components. Each imports only its own core chart class, so
 * `import { LineChart } from '@chartlite/vue'` tree-shakes away the others. Use
 * the generic `<Chart type=… />` when the type comes from data.
 */
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
import {
  areaProps,
  barProps,
  comboProps,
  lineProps,
  pieProps,
  radialProps,
  scatterProps,
  sparklineProps,
} from './props';

/* @__NO_SIDE_EFFECTS__ */
function fixed<C extends CoreConfig>(ctor: ChartConstructor<C>) {
  // SAFETY: the named component's props are that chart's config (see props.ts).
  return chartSetup(() => ctor as ChartConstructor<CoreConfig>);
}

export const LineChart = /* @__PURE__ */ defineComponent({
  name: 'LineChart',
  inheritAttrs: false,
  props: lineProps(),
  setup: /* @__PURE__ */ fixed(CoreLine),
});

export const BarChart = /* @__PURE__ */ defineComponent({
  name: 'BarChart',
  inheritAttrs: false,
  props: barProps(),
  setup: /* @__PURE__ */ fixed(CoreBar),
});

export const AreaChart = /* @__PURE__ */ defineComponent({
  name: 'AreaChart',
  inheritAttrs: false,
  props: areaProps(),
  setup: /* @__PURE__ */ fixed(CoreArea),
});

export const ScatterChart = /* @__PURE__ */ defineComponent({
  name: 'ScatterChart',
  inheritAttrs: false,
  props: scatterProps(),
  setup: /* @__PURE__ */ fixed(CoreScatter),
});

export const PieChart = /* @__PURE__ */ defineComponent({
  name: 'PieChart',
  inheritAttrs: false,
  props: pieProps(),
  setup: /* @__PURE__ */ fixed(CorePie),
});

export const RadialChart = /* @__PURE__ */ defineComponent({
  name: 'RadialChart',
  inheritAttrs: false,
  props: radialProps(),
  setup: /* @__PURE__ */ fixed(CoreRadial),
});

export const ComboChart = /* @__PURE__ */ defineComponent({
  name: 'ComboChart',
  inheritAttrs: false,
  props: comboProps(),
  setup: /* @__PURE__ */ fixed(CoreCombo),
});

export const Sparkline = /* @__PURE__ */ defineComponent({
  name: 'Sparkline',
  inheritAttrs: false,
  props: sparklineProps(),
  setup: /* @__PURE__ */ fixed(CoreSparkline),
});
