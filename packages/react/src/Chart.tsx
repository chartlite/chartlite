import type { ReactElement } from 'react';
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
import { ChartFrame, type ChartFrameOwnProps } from './ChartFrame';
import type {
  ChartConfigByType,
  ChartConstructor,
  ChartType,
} from './useChart';

export type { ChartType } from './useChart';

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

/**
 * Generic, spec-driven chart. Pass a `type` plus any Chartlite config as props —
 * the same shape as a `ChartSpec`. This is the React mirror of
 * `renderToString(spec)`, so a spec produced by an agent/CMS/MCP renders with:
 *
 * ```tsx
 * <Chart type="combo" data={{ series: […], data: […] }} theme="tailwind" />
 * ```
 */
export function Chart<K extends ChartType>({
  type,
  className,
  style,
  onError,
  ...config
}: { type: K } & ChartFrameOwnProps & ChartConfigByType[K]): ReactElement {
  // SAFETY: `config` is the chart-specific props after removing only React wrapper props.
  const chartConfig = config as ChartConfigByType[K];
  return (
    <ChartFrame<ChartConfigByType[K]>
      ctor={REGISTRY[type]}
      config={chartConfig}
      className={className}
      style={style}
      onError={onError}
    />
  );
}
