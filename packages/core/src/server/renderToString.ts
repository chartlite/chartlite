/**
 * Headless, DOM-less chart rendering.
 *
 * `renderToString(spec)` turns a single declarative {@link ChartSpec} object into
 * an SVG string, runnable in Node/Bun/edge with no browser and no jsdom. It uses
 * the SVG DOM shim (`installDOM`) when no real DOM is present, and the real DOM
 * when one is (browser/jsdom) — output is equivalent either way.
 *
 * The same `ChartSpec` object is the payload agents and templates emit, and the
 * input to the `@chartlite/mcp` server.
 *
 * ```ts
 * import { renderToString } from '@chartlite/core/server';
 * const svg = renderToString({ type: 'line', data: [1, 2, 3], theme: 'tailwind' });
 * ```
 */

import { LineChart } from '../charts/LineChart';
import { BarChart } from '../charts/BarChart';
import { AreaChart } from '../charts/AreaChart';
import { ScatterChart } from '../charts/ScatterChart';
import { PieChart } from '../charts/PieChart';
import { Sparkline } from '../charts/Sparkline';
import type {
  LineChartConfig,
  BarChartConfig,
  AreaChartConfig,
  ScatterChartConfig,
  PieChartConfig,
  SparklineConfig,
} from '../types';
import { installDOM } from './dom';

/** The chart types renderable from a declarative spec. */
export type ChartType = 'line' | 'bar' | 'area' | 'scatter' | 'pie' | 'sparkline';

/**
 * A single declarative chart description: a `type` discriminator plus that
 * chart's config (including its `data`). This is the JSON shape agents emit and
 * the published `schema.json` validates.
 */
export type ChartSpec =
  | ({ type: 'line' } & LineChartConfig)
  | ({ type: 'bar' } & BarChartConfig)
  | ({ type: 'area' } & AreaChartConfig)
  | ({ type: 'scatter' } & ScatterChartConfig)
  | ({ type: 'pie' } & PieChartConfig)
  | ({ type: 'sparkline' } & SparklineConfig);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartCtor = new (container: any, config: any) => { render(): void };

const REGISTRY: Record<ChartType, ChartCtor> = {
  line: LineChart,
  bar: BarChart,
  area: AreaChart,
  scatter: ScatterChart,
  pie: PieChart,
  sparkline: Sparkline,
};

/** The chart types this build can render, for callers/validators. */
export const CHART_TYPES = Object.keys(REGISTRY) as ChartType[];

/**
 * Render a chart spec to an SVG string. Throws (with a message that names the
 * valid types) when `spec.type` is unknown.
 */
export function renderToString(spec: ChartSpec): string {
  if (!spec || typeof spec !== 'object') {
    throw new Error('renderToString(spec): spec must be an object with a "type".');
  }
  const { type } = spec;
  const Ctor = REGISTRY[type as ChartType];
  if (!Ctor) {
    throw new Error(
      `renderToString: unknown chart type "${type}". Expected one of: ${CHART_TYPES.join(', ')}.`
    );
  }

  // Strip the discriminator; the rest is the chart config.
  const config = { ...(spec as unknown as Record<string, unknown>) };
  delete config.type;
  // Responsive observers can't run headless; make sure they're off.
  config.responsive = false;

  const restore = installDOM();
  try {
    const container = document.createElement('div');
    const chart = new Ctor(container, config);
    chart.render();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svg = (container as any).firstChild;
    if (!svg) {
      throw new Error('renderToString: chart produced no SVG output.');
    }
    return svg.outerHTML as string;
  } finally {
    restore();
  }
}
