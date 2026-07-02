/**
 * Tool logic for the Chartlite MCP server, kept free of the transport/SDK wiring
 * so it can be unit-tested directly. Each `*Result` function returns a
 * ready-to-emit MCP tool result.
 */

import { z } from 'zod';
import {
  renderToString,
  CHART_TYPES,
  chartSpecSchema,
  type ChartSpec,
} from '@chartlite/core/server';

/** The chart types accepted by `render_chart`. Kept as a tuple for `z.enum`. */
export const CHART_TYPE_TUPLE = [
  'line',
  'bar',
  'area',
  'scatter',
  'pie',
  'radial',
  'combo',
  'sparkline',
] as const;

/**
 * Input schema for `render_chart` — a single `spec` object. Kept permissive
 * (`passthrough`) so every Chartlite option is accepted; the core constructors
 * validate and apply defaults. `data` is intentionally `any`: Chartlite accepts
 * four data shapes and normalizes them.
 */
export const renderChartInput = {
  spec: z
    .object({
      type: z.enum(CHART_TYPE_TUPLE),
      data: z.any(),
      theme: z.string().optional(),
      title: z.string().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    })
    .passthrough()
    .describe('A Chartlite ChartSpec: { type, data, ...options }.'),
};

export interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
  // MCP's CallToolResult carries an open index signature; mirror it so our
  // results are assignable to the SDK handler return type.
  [key: string]: unknown;
}

/** Render a chart spec to SVG. Returns a tool error (not a throw) on bad input. */
export function renderChartResult(spec: ChartSpec): ToolResult {
  try {
    const svg = renderToString(spec);
    return { content: [{ type: 'text', text: svg }] };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error rendering chart: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/** Describe the supported chart types and the full chart-spec JSON Schema. */
export function listChartTypesResult(): ToolResult {
  const payload = {
    chartTypes: CHART_TYPES,
    schema: chartSpecSchema,
  };
  return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
}
