/**
 * Vercel Eve tool: render a Chartlite chart to SVG.
 *
 * Eve tools are plain TypeScript. This file exports:
 *   - `renderChart(spec)` — a pure function you can call directly, and
 *   - `renderChartTool` — a framework-agnostic tool descriptor (name, description,
 *     JSON-schema parameters, execute) that you wrap with your Eve version's tool
 *     helper, e.g. `defineTool(renderChartTool)` or `tool(renderChartTool)`.
 *
 * Runtime dep: `@chartlite/core` (uses the headless `/server` entry — no DOM).
 */

import { renderToString, chartSpecSchema, type ChartSpec } from '@chartlite/core/server';

/** Render a chart spec to an SVG string. */
export function renderChart(spec: ChartSpec): string {
  return renderToString(spec);
}

/** Framework-agnostic descriptor — adapt to your Eve tool helper. */
export const renderChartTool = {
  name: 'render_chart',
  description:
    'Render a chart to an accessible SVG string from a declarative spec ' +
    '({ type, data, ...options }). Types: line, bar, area, scatter, pie, sparkline. ' +
    'Zero client JS — embed the SVG directly in HTML or Markdown.',
  // The published Chartlite JSON Schema doubles as this tool's parameter schema.
  parameters: chartSpecSchema,
  execute: async (spec: ChartSpec): Promise<string> => renderChart(spec),
};

export default renderChartTool;
