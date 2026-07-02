/**
 * `use:chart` — a Svelte action that renders a Chartlite chart into the element
 * it's attached to. Actions are plain functions, so this wrapper needs no Svelte
 * compiler and works across Svelte 3/4/5.
 *
 * ```svelte
 * <script>
 *   import { chart } from '@chartlite/svelte';
 *   let data = [{ x: 'Jan', y: 10 }, { x: 'Feb', y: 20 }];
 * </script>
 *
 * <div use:chart={{ type: 'line', data, theme: 'tailwind' }} />
 * ```
 *
 * The action recreates the chart when its parameters change and destroys it when
 * the element unmounts — the Svelte mirror of the core's `renderToString(spec)`.
 */

import {
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  PieChart,
  RadialChart,
  ComboChart,
  Sparkline,
} from '@chartlite/core';

/** Every chart type the action can render. */
export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'scatter'
  | 'pie'
  | 'radial'
  | 'combo'
  | 'sparkline';

interface ChartInstance {
  render(): void;
  destroy(): void;
}
type ChartConstructor = new (el: HTMLElement, config: Record<string, unknown>) => ChartInstance;

const REGISTRY: Record<ChartType, ChartConstructor> = {
  line: LineChart as unknown as ChartConstructor,
  bar: BarChart as unknown as ChartConstructor,
  area: AreaChart as unknown as ChartConstructor,
  scatter: ScatterChart as unknown as ChartConstructor,
  pie: PieChart as unknown as ChartConstructor,
  radial: RadialChart as unknown as ChartConstructor,
  combo: ComboChart as unknown as ChartConstructor,
  sparkline: Sparkline as unknown as ChartConstructor,
};

/** Parameters for the `chart` action: a `type` plus any Chartlite config. */
export type ChartParams = {
  type: ChartType;
  /** Called if the chart throws while rendering. */
  onError?: (error: Error) => void;
} & Record<string, unknown>;

/** The object Svelte expects an action to return. */
export interface ActionReturn {
  update(params: ChartParams): void;
  destroy(): void;
}

function showError(node: HTMLElement, message: string): void {
  node.textContent = '';
  const box = document.createElement('div');
  box.setAttribute(
    'style',
    'padding:20px;color:#dc2626;border:1px solid #fecaca;border-radius:4px;background-color:#fee2e2'
  );
  box.innerHTML = `<strong>Chart Error:</strong> `;
  box.append(message);
  node.appendChild(box);
}

export function chart(node: HTMLElement, params: ChartParams): ActionReturn {
  let instance: ChartInstance | null = null;

  const build = (p: ChartParams): void => {
    const { type, onError, ...config } = p;
    try {
      instance?.destroy();
      instance = null;
      node.textContent = '';
      const Ctor = REGISTRY[type];
      if (!Ctor) throw new Error(`Unknown chart type: ${String(type)}`);
      instance = new Ctor(node, config);
      instance.render();
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error(String(err));
      if (onError) onError(normalized);
      else console.error('Chartlite render error:', normalized);
      showError(node, normalized.message);
    }
  };

  build(params);

  return {
    update(next: ChartParams) {
      build(next);
    },
    destroy() {
      instance?.destroy();
      instance = null;
    },
  };
}
