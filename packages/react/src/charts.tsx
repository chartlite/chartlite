/**
 * Named, per-type React components. Each imports only its own core chart class,
 * so `import { LineChart } from '@chartlite/react'` tree-shakes away the other
 * chart types. They share the mount/render/cleanup logic in {@link ChartFrame}.
 *
 * Use these when you know the chart type at author time; use the generic
 * `<Chart type=… />` when the type comes from data (a spec, CMS, or agent).
 */
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
  type LineChartConfig,
  type BarChartConfig,
  type AreaChartConfig,
  type ScatterChartConfig,
  type PieChartConfig,
  type RadialChartConfig,
  type ComboChartConfig,
  type SparklineConfig,
} from '@chartlite/core';
import { ChartFrame, type ChartComponentProps, type ChartHandle } from './ChartFrame';

export type LineChartProps = ChartComponentProps<LineChartConfig>;
export type BarChartProps = ChartComponentProps<BarChartConfig>;
export type AreaChartProps = ChartComponentProps<AreaChartConfig>;
export type ScatterChartProps = ChartComponentProps<ScatterChartConfig>;
export type PieChartProps = ChartComponentProps<PieChartConfig>;
export type RadialChartProps = ChartComponentProps<RadialChartConfig>;
export type ComboChartProps = ChartComponentProps<ComboChartConfig>;
export type SparklineProps = ChartComponentProps<SparklineConfig>;

// `forwardRef(...)` calls are annotated pure so bundlers can drop unused charts.

export const LineChart = /* @__PURE__ */ forwardRef<ChartHandle, LineChartProps>(
  function LineChart(props, ref) {
    return <ChartFrame ctor={CoreLine} props={props} forwardedRef={ref} />;
  }
);
export const BarChart = /* @__PURE__ */ forwardRef<ChartHandle, BarChartProps>(
  function BarChart(props, ref) {
    return <ChartFrame ctor={CoreBar} props={props} forwardedRef={ref} />;
  }
);
export const AreaChart = /* @__PURE__ */ forwardRef<ChartHandle, AreaChartProps>(
  function AreaChart(props, ref) {
    return <ChartFrame ctor={CoreArea} props={props} forwardedRef={ref} />;
  }
);
export const ScatterChart = /* @__PURE__ */ forwardRef<ChartHandle, ScatterChartProps>(
  function ScatterChart(props, ref) {
    return <ChartFrame ctor={CoreScatter} props={props} forwardedRef={ref} />;
  }
);
export const PieChart = /* @__PURE__ */ forwardRef<ChartHandle, PieChartProps>(
  function PieChart(props, ref) {
    return <ChartFrame ctor={CorePie} props={props} forwardedRef={ref} />;
  }
);
export const RadialChart = /* @__PURE__ */ forwardRef<ChartHandle, RadialChartProps>(
  function RadialChart(props, ref) {
    return <ChartFrame ctor={CoreRadial} props={props} forwardedRef={ref} />;
  }
);
export const ComboChart = /* @__PURE__ */ forwardRef<ChartHandle, ComboChartProps>(
  function ComboChart(props, ref) {
    return <ChartFrame ctor={CoreCombo} props={props} forwardedRef={ref} />;
  }
);
export const Sparkline = /* @__PURE__ */ forwardRef<ChartHandle, SparklineProps>(
  function Sparkline(props, ref) {
    return <ChartFrame ctor={CoreSparkline} props={props} forwardedRef={ref} />;
  }
);
