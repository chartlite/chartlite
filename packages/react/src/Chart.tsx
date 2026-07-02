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

/**
 * Maps a `type` string to its core chart class. Referenced statically, so using
 * `<Chart>` bundles all chart types — reach for the named components
 * (`<LineChart>`, …) instead if you want per-type tree-shaking.
 */
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
 * Generic, spec-driven chart. Pass a `type` plus any Chartlite config as props —
 * the same shape as a `ChartSpec`. This is the React mirror of
 * `renderToString(spec)`, so a spec produced by an agent/CMS/MCP renders with:
 *
 * ```tsx
 * <Chart type="combo" data={{ series: […], data: […] }} theme="tailwind" />
 * ```
 */
export function Chart({
  type,
  className,
  style,
  onError,
  ...config
}: { type: ChartType } & ChartFrameOwnProps & Record<string, unknown>): ReactElement {
  return (
    <ChartFrame
      ctor={REGISTRY[type]}
      config={config}
      className={className}
      style={style}
      onError={onError}
    />
  );
}
