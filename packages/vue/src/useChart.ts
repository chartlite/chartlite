import { onMounted, onBeforeUnmount, ref, watch, type Ref } from 'vue';

/** The subset of the core chart instance the wrapper relies on. */
interface ChartInstance {
  render(): void;
  destroy(): void;
}

/** Any core chart constructor: `new Ctor(container, config)`. */
export type ChartConstructor = new (
  container: HTMLElement,
  config: Record<string, unknown>
) => ChartInstance;

/**
 * Stable dependency key for a config object, including callback/formatter identity.
 */
const identities = new WeakMap<object, number>();
let nextIdentity = 0;

function identity(value: object): number {
  let id = identities.get(value);
  if (id === undefined) {
    id = ++nextIdentity;
    identities.set(value, id);
  }
  return id;
}

export function configSignature(config: Record<string, unknown>): string {
  try {
    return JSON.stringify(config, (_key, value) =>
      typeof value === 'function' ? `__chartlite_fn_${identity(value)}` : value
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
export function useChart(
  getCtor: () => ChartConstructor | undefined,
  getConfig: () => Record<string, unknown>,
  getOnError?: () => ((error: Error) => void) | undefined
): { container: Ref<HTMLElement | null>; error: Ref<Error | null> } {
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
