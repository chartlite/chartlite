import { useEffect, useRef } from 'react';
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

/** Configuration accepted by each React chart wrapper. */
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

export interface UseChartResult {
  containerRef: React.RefObject<HTMLDivElement>;
  controller: ChartController;
}

/**
 * Shared imperative bridge between React and a core chart class, backed by a
 * {@link ChartController}. After every commit the controller diffs the props:
 * unchanged props are a no-op, a data-only change calls `chart.update(data)`,
 * and any other option change (or a new `Ctor`) recreates the chart. Callback
 * and formatter props are read through stable proxies, so inline arrow
 * functions never recreate the chart. The chart is destroyed on unmount.
 *
 * Named components pass a concrete `Ctor` so only that chart class is bundled;
 * the generic `<Chart>` resolves `Ctor` from the registry.
 */
export function useChart<C extends CoreConfig>(
  Ctor: ChartConstructor<C> | undefined,
  config: C,
  options: BridgeOptions = {}
): UseChartResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ChartController | null>(null);
  if (controllerRef.current === null) controllerRef.current = new ChartController();
  const controller = controllerRef.current;

  // Runs after every commit; the controller decides whether anything changed.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    controller.sync(container, Ctor, config, options);
  });

  useEffect(() => () => controller.destroy(), [controller]);

  return { containerRef, controller };
}
