/**
 * Named, per-type Vue components. Each imports only its own core chart class, so
 * `import { LineChart } from '@chartlite/vue'` tree-shakes away the others. Use
 * the generic `<Chart type=… />` when the type comes from data.
 */
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

/* @__NO_SIDE_EFFECTS__ */
const named = (name: string, ctor: unknown) =>
  defineChartComponent(name, () => ctor as ChartConstructor);

export const LineChart = /* @__PURE__ */ named('LineChart', CoreLine);
export const BarChart = /* @__PURE__ */ named('BarChart', CoreBar);
export const AreaChart = /* @__PURE__ */ named('AreaChart', CoreArea);
export const ScatterChart = /* @__PURE__ */ named('ScatterChart', CoreScatter);
export const PieChart = /* @__PURE__ */ named('PieChart', CorePie);
export const RadialChart = /* @__PURE__ */ named('RadialChart', CoreRadial);
export const ComboChart = /* @__PURE__ */ named('ComboChart', CoreCombo);
export const Sparkline = /* @__PURE__ */ named('Sparkline', CoreSparkline);
