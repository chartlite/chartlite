/**
 * `use:chart` — a Svelte action that renders a Chartlite chart into the element
 * it's attached to. Actions are plain functions, so this wrapper needs no Svelte
 * compiler and works with Svelte 4 and 5.
 *
 * ```svelte
 * <script>
 *   import { chart } from '@chartlite/svelte';
 *   let data = [{ x: 'Jan', y: 10 }, { x: 'Feb', y: 20 }];
 * </script>
 *
 * <div use:chart={{ type: 'line', data, theme: 'tailwind', tooltip: true }} />
 * ```
 *
 * When the parameters change, the action diffs them: a data-only change calls
 * `chart.update(data)`, new callback identities are picked up without
 * re-rendering, and any other option change recreates the chart. The chart is
 * destroyed when the element unmounts — the Svelte mirror of the core's
 * `renderToString(spec)`.
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
  type ChartConstructor,
  type ChartInstance,
  type CoreConfig,
  type WrapperOptions,
} from './bridge';

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

/**
 * A chart spec keyed on `type`: the same discriminated union as core's
 * `ChartSpec`, so each `type` only accepts its own chart's options (a typo such
 * as `curv: 'smooth'` is a type error).
 */
export type ChartSpecParams =
  | ({ type: 'line' } & LineChartConfig)
  | ({ type: 'bar' } & BarChartConfig)
  | ({ type: 'area' } & AreaChartConfig)
  | ({ type: 'scatter' } & ScatterChartConfig)
  | ({ type: 'pie' } & PieChartConfig)
  | ({ type: 'radial' } & RadialChartConfig)
  | ({ type: 'combo' } & ComboChartConfig)
  | ({ type: 'sparkline' } & Omit<SparklineConfig, 'type'>);

/** Parameters for the `chart` action: a chart spec plus wrapper options. */
export type ChartParams = ChartSpecParams &
  WrapperOptions & {
    /** Called if the chart throws while rendering or updating. */
    onError?: (error: Error) => void;
  };

const REGISTRY = {
  line: LineChart,
  bar: BarChart,
  area: AreaChart,
  scatter: ScatterChart,
  pie: PieChart,
  radial: RadialChart,
  combo: ComboChart,
  sparkline: Sparkline,
};

function lookup(type: string): ChartConstructor<CoreConfig> | undefined {
  if (!Object.prototype.hasOwnProperty.call(REGISTRY, type)) return undefined;
  // SAFETY: `type` is an own key of REGISTRY (checked above), and the params for
  // a given `type` are that chart's config by the ChartSpecParams union.
  return REGISTRY[type as ChartType] as ChartConstructor<CoreConfig>;
}

/** The object Svelte expects an action to return. */
export interface ActionReturn {
  update(params: ChartParams): void;
  destroy(): void;
  /** The live core chart instance, or `null` after an error / destroy. */
  readonly chart: ChartInstance | null;
}

export function chart(node: HTMLElement, params: ChartParams): ActionReturn {
  const controller = new ChartController();

  const sync = (next: ChartParams): void => {
    const { type, tooltip, onError, ...config } = next;
    controller.sync(node, lookup(type), config, { tooltip, onError, type });
  };

  sync(params);

  return {
    update: sync,
    destroy() {
      controller.destroy();
    },
    get chart() {
      return controller.chart;
    },
  };
}
