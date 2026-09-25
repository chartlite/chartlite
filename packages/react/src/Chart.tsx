import { forwardRef } from 'react';
import {
  LineChart as CoreLine,
  BarChart as CoreBar,
  AreaChart as CoreArea,
  ScatterChart as CoreScatter,
  PieChart as CorePie,
  RadialChart as CoreRadial,
  ComboChart as CoreCombo,
  Sparkline as CoreSparkline,
  type AreaChartConfig,
  type BarChartConfig,
  type ComboChartConfig,
  type LineChartConfig,
  type PieChartConfig,
  type RadialChartConfig,
  type ScatterChartConfig,
  type SparklineConfig,
} from '@chartlite/core';
import type { ChartConstructor, CoreConfig } from './bridge';
import {
  ChartFrame,
  type ChartContainerAttributes,
  type ChartFrameOwnProps,
  type ChartHandle,
} from './ChartFrame';
import type { ChartConfigByType, ChartType } from './useChart';

export type { ChartType } from './useChart';

/**
 * A chart spec keyed on `type`: the same discriminated union as core's
 * `ChartSpec`, so each `type` only accepts its own chart's options (a typo such
 * as `curv="smooth"` is a type error). Sparkline's own line/area style `type`
 * is not available here because `type` selects the chart.
 */
export type ChartSpecProps =
  | ({ type: 'line' } & LineChartConfig)
  | ({ type: 'bar' } & BarChartConfig)
  | ({ type: 'area' } & AreaChartConfig)
  | ({ type: 'scatter' } & ScatterChartConfig)
  | ({ type: 'pie' } & PieChartConfig)
  | ({ type: 'radial' } & RadialChartConfig)
  | ({ type: 'combo' } & ComboChartConfig)
  | ({ type: 'sparkline' } & Omit<SparklineConfig, 'type'>);

/** Props for the generic `<Chart>`. */
export type ChartProps = ChartSpecProps & ChartFrameOwnProps & ChartContainerAttributes;

/**
 * Maps a `type` string to its core chart class. Referenced statically, so using
 * `<Chart>` bundles all chart types — reach for the named components
 * (`<LineChart>`, …) instead if you want per-type tree-shaking.
 */
type ChartRegistry = {
  [K in ChartType]: ChartConstructor<ChartConfigByType[K]>;
};

const REGISTRY: ChartRegistry = {
  line: CoreLine,
  bar: CoreBar,
  area: CoreArea,
  scatter: CoreScatter,
  pie: CorePie,
  radial: CoreRadial,
  combo: CoreCombo,
  sparkline: CoreSparkline,
};

function lookup(type: string): ChartConstructor<CoreConfig> | undefined {
  if (!Object.prototype.hasOwnProperty.call(REGISTRY, type)) return undefined;
  // SAFETY: `type` is an own key of REGISTRY (checked above), and the props for a
  // given `type` are that chart's config by the ChartSpecProps discriminated union.
  return REGISTRY[type as ChartType] as ChartConstructor<CoreConfig>;
}

/**
 * Generic, spec-driven chart. Pass a `type` plus any Chartlite config as props —
 * the same shape as a `ChartSpec`. This is the React mirror of
 * `renderToString(spec)`, so a spec produced by an agent/CMS/MCP renders with:
 *
 * ```tsx
 * <Chart type="combo" data={{ series: […], data: […] }} theme="tailwind" />
 * ```
 */
export const Chart = /* @__PURE__ */ forwardRef<ChartHandle, ChartProps>(function Chart(
  { type, ...props },
  ref
) {
  return <ChartFrame ctor={lookup(type)} props={props} type={type} forwardedRef={ref} />;
});
