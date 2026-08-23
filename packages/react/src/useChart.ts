import { useEffect, useRef, useState } from 'react';
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

/** The subset of the core chart instance the wrapper relies on. */
interface ChartInstance {
  render(): void;
  destroy(): void;
}

/** Any core chart constructor: `new Ctor(container, config)`. */
export type ChartConstructor<C extends ChartConfig> = new (
  container: HTMLElement,
  config: C
) => ChartInstance;

/**
 * Build a stable dependency key from a config object. Functions are compared by
 * identity so callback, formatter, and plugin changes recreate the chart too.
 */
const identities = new WeakMap<WeakKey, number>();
let nextIdentity = 0;

function identity(value: WeakKey): number {
  let id = identities.get(value);
  if (id === undefined) {
    id = ++nextIdentity;
    identities.set(value, id);
  }
  return id;
}

function configSignature(config: ChartConfig): string {
  try {
    return JSON.stringify(config, (_key, value) =>
      value instanceof Function ? `__chartlite_fn_${identity(value)}` : value
    );
  } catch {
    return `__chartlite_config_${identity(config)}`;
  }
}

/**
 * Shared imperative bridge between React and a core chart class. Creates the
 * chart on mount, recreates it when `Ctor` or the serializable config changes,
 * and destroys it on unmount. Errors are surfaced via `onError` (or logged).
 *
 * Named components pass a concrete `Ctor` so only that chart class is bundled;
 * the generic `<Chart>` resolves `Ctor` from the registry.
 */
export interface UseChartResult {
  containerRef: React.RefObject<HTMLDivElement>;
  error: Error | null;
}

export function useChart<C extends ChartConfig>(
  Ctor: ChartConstructor<C> | undefined,
  config: C,
  onError?: (error: Error) => void
): UseChartResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // `onError` is read via a ref so a changing callback identity doesn't recreate
  // the chart.
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const signature = configSignature(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      chartRef.current?.destroy();
      if (!Ctor) {
        throw new Error('Chart: no chart constructor for the given `type`.');
      }
      const chart = new Ctor(container, config);
      chart.render();
      chartRef.current = chart;
      setError(null);
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error(String(err));
      setError(normalized);
      if (onErrorRef.current) onErrorRef.current(normalized);
      else console.error('Chartlite render error:', normalized);
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // config is intentionally tracked via `signature`, not by reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Ctor, signature]);

  return { containerRef, error };
}
