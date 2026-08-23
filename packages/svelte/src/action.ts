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
import type {
  AreaChartConfig,
  BarChartConfig,
  BaseChartConfig,
  ComboChartConfig,
  FlexibleDataInput,
  LineChartConfig,
  PieChartConfig,
  RadialChartConfig,
  ScatterChartConfig,
  SparklineConfig,
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

/** Parameters for the `chart` action: a `type` plus any Chartlite config. */
export interface ChartParams extends BaseChartConfig {
  type: ChartType;
  data?: FlexibleDataInput;
  curve?: LineChartConfig['curve'];
  showPoints?: LineChartConfig['showPoints'];
  orientation?: BarChartConfig['orientation'];
  stacked?: BarChartConfig['stacked'];
  fillOpacity?: AreaChartConfig['fillOpacity'];
  gradient?: AreaChartConfig['gradient'];
  innerRadius?: PieChartConfig['innerRadius'];
  showLabels?: PieChartConfig['showLabels'];
  max?: RadialChartConfig['max'];
  startAngle?: RadialChartConfig['startAngle'];
  endAngle?: RadialChartConfig['endAngle'];
  thickness?: RadialChartConfig['thickness'];
  showValue?: RadialChartConfig['showValue'];
  trackColor?: RadialChartConfig['trackColor'];
  defaultType?: ComboChartConfig['defaultType'];
  pointSize?: ScatterChartConfig['pointSize'];
  labelOffset?: ScatterChartConfig['labelOffset'];
  labelPosition?: ScatterChartConfig['labelPosition'];
  pointShape?: ScatterChartConfig['pointShape'];
  showEndDot?: SparklineConfig['showEndDot'];
  strokeWidth?: SparklineConfig['strokeWidth'];
  /** Called if the chart throws while rendering. */
  onError?: (error: Error) => void;
}

type ChartConfig = Omit<ChartParams, 'type' | 'onError'>;

function requiredData(config: ChartConfig): FlexibleDataInput {
  if (config.data === undefined) throw new Error('Chart data is required');
  return config.data;
}

function createChart(
  container: HTMLElement,
  type: ChartType,
  config: ChartConfig,
): ChartInstance {
  switch (type) {
    case 'line':
      return new LineChart(container, { ...config, data: requiredData(config) });
    case 'bar':
      return new BarChart(container, { ...config, data: requiredData(config) });
    case 'area':
      return new AreaChart(container, { ...config, data: requiredData(config) });
    case 'scatter':
      return new ScatterChart(container, { ...config, data: requiredData(config) });
    case 'pie':
      return new PieChart(container, { ...config, data: requiredData(config) });
    case 'radial':
      return new RadialChart(container, { ...config, data: requiredData(config) });
    case 'combo':
      return new ComboChart(container, { ...config, data: requiredData(config) });
    case 'sparkline':
      return new Sparkline(container, { ...config, data: requiredData(config) });
    default:
      throw new Error(`Unknown chart type: ${type}`);
  }
}

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
      instance = createChart(node, type, config);
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
