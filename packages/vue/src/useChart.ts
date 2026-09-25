import { onBeforeUnmount, ref, shallowRef, watchPostEffect, type Ref, type ShallowRef } from 'vue';
import type {
  AreaChartConfig,
  BarChartConfig,
  ComboChartConfig,
  LineChartConfig,
  PieChartConfig,
  RadialChartConfig,
  ScatterChartConfig,
  SparklineConfig,
} from '@chartlite/core';
import {
  ChartController,
  type BridgeOptions,
  type ChartConstructor,
  type ChartInstance,
  type CoreConfig,
} from './bridge';

export type { ChartConstructor, ChartInstance } from './bridge';

export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'scatter'
  | 'pie'
  | 'radial'
  | 'combo'
  | 'sparkline';

/** Configuration accepted by each Vue chart wrapper. */
export interface ChartConfigByType {
  line: LineChartConfig;
  bar: BarChartConfig;
  area: AreaChartConfig;
  scatter: ScatterChartConfig;
  pie: PieChartConfig;
  radial: RadialChartConfig;
  combo: ComboChartConfig;
  sparkline: SparklineConfig;
}

export type ChartConfig = ChartConfigByType[ChartType];

/** One snapshot of what the component wants rendered. */
export interface ChartInput {
  Ctor: ChartConstructor<CoreConfig> | undefined;
  config: CoreConfig;
  options: BridgeOptions;
}

export interface UseChartResult {
  container: Ref<HTMLElement | null>;
  /** The live core chart instance (or `null`). */
  chart: ShallowRef<ChartInstance | null>;
  /** The current render/update error (or `null`). */
  error: ShallowRef<Error | null>;
  controller: ChartController;
}

/**
 * Shared bridge between a Vue component and a core chart class, backed by a
 * {@link ChartController}. `read()` is evaluated in a post-flush effect, so every
 * reactive prop/attr it touches (including deep reads of `data`) re-syncs the
 * chart: unchanged input is a no-op, a data-only change calls
 * `chart.update(data)`, and any other option change recreates the chart. Callback
 * props are read through stable proxies, so new function identities never
 * recreate it. The chart is destroyed on unmount.
 */
export function useChart(read: () => ChartInput): UseChartResult {
  const container = ref<HTMLElement | null>(null);
  const chart = shallowRef<ChartInstance | null>(null);
  const error = shallowRef<Error | null>(null);
  const controller = new ChartController();

  watchPostEffect(() => {
    const input = read();
    const el = container.value;
    if (!el) return;
    controller.sync(el, input.Ctor, input.config, input.options);
    chart.value = controller.chart;
    error.value = controller.error;
  });

  onBeforeUnmount(() => {
    controller.destroy();
    chart.value = null;
  });

  return { container, chart, error, controller };
}
