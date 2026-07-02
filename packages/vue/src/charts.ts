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

const named = (name: string, ctor: unknown) =>
  defineChartComponent(name, () => ctor as ChartConstructor);

export const LineChart = named('LineChart', CoreLine);
export const BarChart = named('BarChart', CoreBar);
export const AreaChart = named('AreaChart', CoreArea);
export const ScatterChart = named('ScatterChart', CoreScatter);
export const PieChart = named('PieChart', CorePie);
export const RadialChart = named('RadialChart', CoreRadial);
export const ComboChart = named('ComboChart', CoreCombo);
export const Sparkline = named('Sparkline', CoreSparkline);
