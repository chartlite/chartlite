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
import type {
  ChartConfigByType,
  ChartConstructor,
  ChartType,
} from './useChart';

type Props<C> = C & ChartFrameOwnProps;

/** Render a named component without module-load factory calls, preserving tree-shaking. */
function renderNamed<K extends ChartType>(
  ctor: ChartConstructor<ChartConfigByType[K]>,
  props: Props<ChartConfigByType[K]>,
): ReactElement {
  const { className, style, onError, ...config } = props;
  // SAFETY: `config` is the chart-specific props after removing only React wrapper props.
  const chartConfig = config as ChartConfigByType[K];
  return (
    <ChartFrame<ChartConfigByType[K]>
      ctor={ctor}
      config={chartConfig}
      className={className}
      style={style}
      onError={onError}
    />
  );
}

export function LineChart(props: Props<LineChartConfig>): ReactElement {
  return renderNamed<'line'>(CoreLine, props);
}
export function BarChart(props: Props<BarChartConfig>): ReactElement {
  return renderNamed<'bar'>(CoreBar, props);
}
export function AreaChart(props: Props<AreaChartConfig>): ReactElement {
  return renderNamed<'area'>(CoreArea, props);
}
export function ScatterChart(props: Props<ScatterChartConfig>): ReactElement {
  return renderNamed<'scatter'>(CoreScatter, props);
}
export function PieChart(props: Props<PieChartConfig>): ReactElement {
  return renderNamed<'pie'>(CorePie, props);
}
export function RadialChart(props: Props<RadialChartConfig>): ReactElement {
  return renderNamed<'radial'>(CoreRadial, props);
}
export function ComboChart(props: Props<ComboChartConfig>): ReactElement {
  return renderNamed<'combo'>(CoreCombo, props);
}
export function Sparkline(props: Props<SparklineConfig>): ReactElement {
  return renderNamed<'sparkline'>(CoreSparkline, props);
}
