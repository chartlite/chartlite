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
import { RadialChart } from '../charts/RadialChart';
import { ComboChart } from '../charts/ComboChart';
import { Sparkline } from '../charts/Sparkline';
import type {
  LineChartConfig,
  BarChartConfig,
  AreaChartConfig,
  ScatterChartConfig,
  PieChartConfig,
  RadialChartConfig,
  ComboChartConfig,
  SparklineConfig,
} from '../types';
import { installDOM } from './dom';

/** The chart types renderable from a declarative spec. */
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
  | ({ type: 'radial' } & RadialChartConfig)
  | ({ type: 'combo' } & ComboChartConfig)
  | ({ type: 'sparkline' } & Omit<SparklineConfig, 'type'>);

type ChartSpecFor<Type extends ChartType> = Extract<ChartSpec, { type: Type }>;

interface ChartRegistry {
  line(container: HTMLElement, spec: ChartSpecFor<'line'>): void;
  bar(container: HTMLElement, spec: ChartSpecFor<'bar'>): void;
  area(container: HTMLElement, spec: ChartSpecFor<'area'>): void;
  scatter(container: HTMLElement, spec: ChartSpecFor<'scatter'>): void;
  pie(container: HTMLElement, spec: ChartSpecFor<'pie'>): void;
  radial(container: HTMLElement, spec: ChartSpecFor<'radial'>): void;
  combo(container: HTMLElement, spec: ChartSpecFor<'combo'>): void;
  sparkline(container: HTMLElement, spec: ChartSpecFor<'sparkline'>): void;
}

function stripType<T extends { type: string }>(spec: T): Omit<T, 'type'> {
  const { type, ...config } = spec;
  if (!type) {
    throw new Error('renderToString: chart type is required.');
  }
  return config;
}

const REGISTRY = {
  line(container, spec) {
    new LineChart(container, { ...stripType(spec), responsive: false }).render();
  },
  bar(container, spec) {
    new BarChart(container, { ...stripType(spec), responsive: false }).render();
  },
  area(container, spec) {
    new AreaChart(container, { ...stripType(spec), responsive: false }).render();
  },
  scatter(container, spec) {
    new ScatterChart(container, { ...stripType(spec), responsive: false }).render();
  },
  pie(container, spec) {
    new PieChart(container, { ...stripType(spec), responsive: false }).render();
  },
  radial(container, spec) {
    new RadialChart(container, { ...stripType(spec), responsive: false }).render();
  },
  combo(container, spec) {
    new ComboChart(container, { ...stripType(spec), responsive: false }).render();
  },
  sparkline(container, spec) {
    new Sparkline(container, { ...stripType(spec), responsive: false }).render();
  },
} satisfies ChartRegistry;

const CHART_KEYS = [
  'line',
  'bar',
  'area',
  'scatter',
  'pie',
  'radial',
  'combo',
  'sparkline',
] as const;

function isChartType(value: string): value is ChartType {
  for (const chartType of CHART_KEYS) {
    if (chartType === value) return true;
  }
  return false;
}

function renderFromRegistry(container: HTMLElement, spec: ChartSpec): void {
  switch (spec.type) {
    case 'line':
      REGISTRY.line(container, spec);
      return;
    case 'bar':
      REGISTRY.bar(container, spec);
      return;
    case 'area':
      REGISTRY.area(container, spec);
      return;
    case 'scatter':
      REGISTRY.scatter(container, spec);
      return;
    case 'pie':
      REGISTRY.pie(container, spec);
      return;
    case 'radial':
      REGISTRY.radial(container, spec);
      return;
    case 'combo':
      REGISTRY.combo(container, spec);
      return;
    case 'sparkline':
      REGISTRY.sparkline(container, spec);
      return;
  }
}

/** The chart types this build can render, for callers/validators. */
export const CHART_TYPES = [...CHART_KEYS];

/**
 * Render a chart spec to an SVG string. Throws (with a message that names the
 * valid types) when `spec.type` is unknown.
 */
export function renderToString(spec: ChartSpec): string {
  if (!spec) {
    throw new Error('renderToString(spec): spec must be an object with a "type".');
  }
  const { type } = spec;
  if (!isChartType(type)) {
    throw new Error(
      `renderToString: unknown chart type "${type}". Expected one of: ${CHART_TYPES.join(', ')}.`
    );
  }

  const restore = installDOM();
  try {
    const container = document.createElement('div');
    renderFromRegistry(container, spec);
    const svg = container.firstElementChild;
    if (!svg) {
      throw new Error('renderToString: chart produced no SVG output.');
    }
    return svg.outerHTML;
  } finally {
    restore();
  }
}
