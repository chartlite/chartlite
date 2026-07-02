import { useEffect, useRef, useState } from 'react';

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
 * Build a stable dependency key from a config object. Functions (callbacks,
 * formatters) are dropped — they can't be compared by value — so the chart is
 * recreated when the *data or visual* config changes, which is what matters.
 */
function configSignature(config: Record<string, unknown>): string {
  try {
    return JSON.stringify(config, (_key, value) =>
      typeof value === 'function' ? undefined : value
    );
  } catch {
    // Circular/non-serializable config: fall back to always-recreate.
    return String(Math.random());
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
export function useChart(
  Ctor: ChartConstructor | undefined,
  config: Record<string, unknown>,
  onError?: (error: Error) => void
): { containerRef: React.RefObject<HTMLDivElement>; error: Error | null } {
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
