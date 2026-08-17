import { onMounted, onBeforeUnmount, ref, watch, type Ref } from 'vue';
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
 * Stable dependency key for a config object, including callback/formatter identity.
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

export function configSignature(config: ChartConfig): string {
  try {
    return JSON.stringify(config, (_key, value) =>
      value instanceof Function ? `__chartlite_fn_${identity(value)}` : value
    );
  } catch {
    return `__chartlite_config_${identity(config)}`;
  }
}

/**
 * Shared bridge between a Vue component and a core chart class. Creates the chart
 * on mount, recreates it when the constructor (i.e. the generic `type`) or the
 * serializable config changes, and destroys it on unmount. Returns the container
 * ref to bind and a reactive `error`.
 */
export interface UseChartResult {
  container: Ref<HTMLElement | null>;
  error: Ref<Error | null>;
}

export function useChart<C extends ChartConfig>(
  getCtor: () => ChartConstructor<C> | undefined,
  getConfig: () => C,
  getOnError?: () => ((error: Error) => void) | undefined
): UseChartResult {
  const container = ref<HTMLElement | null>(null);
  const error = ref<Error | null>(null);
  let chart: ChartInstance | null = null;

  const build = (): void => {
    if (!container.value) return;
    try {
      chart?.destroy();
      const Ctor = getCtor();
      if (!Ctor) throw new Error('Chart: no chart constructor for the given `type`.');
      chart = new Ctor(container.value, getConfig());
      chart.render();
      error.value = null;
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error(String(err));
      error.value = normalized;
      const onError = getOnError?.();
      if (onError) onError(normalized);
      else console.error('Chartlite render error:', normalized);
    }
  };

  onMounted(build);
  // Recreate when the constructor identity or the config signature changes.
  watch([getCtor, () => configSignature(getConfig())], build);
  onBeforeUnmount(() => {
    chart?.destroy();
    chart = null;
  });

  return { container, error };
}
