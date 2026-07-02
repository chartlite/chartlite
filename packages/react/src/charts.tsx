/**
 * Named, per-type React components. Each imports only its own core chart class,
 * so `import { LineChart } from '@chartlite/react'` tree-shakes away the other
 * chart types. They share the mount/render/cleanup logic in {@link ChartFrame}.
 *
 * Use these when you know the chart type at author time; use the generic
 * `<Chart type=… />` when the type comes from data (a spec, CMS, or agent).
 */
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
  type LineChartConfig,
  type BarChartConfig,
  type AreaChartConfig,
  type ScatterChartConfig,
  type PieChartConfig,
  type RadialChartConfig,
  type ComboChartConfig,
  type SparklineConfig,
} from '@chartlite/core';
import { ChartFrame, type ChartFrameOwnProps } from './ChartFrame';
import type { ChartConstructor } from './useChart';

type Props<C> = C & ChartFrameOwnProps;

/** Build a named component bound to a single core chart class. */
function makeChart<C>(ctor: unknown, displayName: string) {
  function Component({ className, style, onError, ...config }: Props<C>): ReactElement {
    return (
      <ChartFrame
        ctor={ctor as ChartConstructor}
        config={config as Record<string, unknown>}
        className={className}
        style={style}
        onError={onError}
      />
    );
  }
  Component.displayName = displayName;
  return Component;
}

export const LineChart = makeChart<LineChartConfig>(CoreLine, 'LineChart');
export const BarChart = makeChart<BarChartConfig>(CoreBar, 'BarChart');
export const AreaChart = makeChart<AreaChartConfig>(CoreArea, 'AreaChart');
export const ScatterChart = makeChart<ScatterChartConfig>(CoreScatter, 'ScatterChart');
export const PieChart = makeChart<PieChartConfig>(CorePie, 'PieChart');
export const RadialChart = makeChart<RadialChartConfig>(CoreRadial, 'RadialChart');
export const ComboChart = makeChart<ComboChartConfig>(CoreCombo, 'ComboChart');
export const Sparkline = makeChart<SparklineConfig>(CoreSparkline, 'Sparkline');
