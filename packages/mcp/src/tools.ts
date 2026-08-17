/**
 * Tool logic for the Chartlite MCP server, kept free of the transport/SDK wiring
 * so it can be unit-tested directly. Each `*Result` function returns a
 * ready-to-emit MCP tool result.
 */

import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { FlexibleDataInput } from '@chartlite/core';
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

const THEME_TUPLE = [
  'default',
  'midnight',
  'minimal',
  'tailwind',
  'nord',
  'high-contrast',
] as const;

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

const jsonValueSchema: z.ZodType<JSONValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ])
);

const xValueSchema = z.union([z.string(), z.number().finite()]);
const finiteNumberArraySchema = z.array(z.number().finite());
const flexibleDataSchema: z.ZodType<FlexibleDataInput> = z.union([
  z.array(z.object({
    x: xValueSchema,
    y: z.number().finite(),
    label: z.string().optional(),
  })),
  finiteNumberArraySchema,
  z.object({
    x: z.array(xValueSchema),
    y: z.union([finiteNumberArraySchema, z.record(finiteNumberArraySchema)]),
  }),
  z.object({
    series: z.array(z.object({
      name: z.string(),
      dataKey: z.string(),
      type: z.enum(['line', 'bar', 'area']).optional(),
      color: z.string().optional(),
    })),
    data: z.array(z.record(jsonValueSchema)),
    xKey: z.string().optional(),
  }),
]);

/**
 * Input schema for `render_chart` — a single `spec` object.
 * Chart-specific options pass through to core, while the shared fields and all
 * four supported data shapes are validated at the MCP boundary.
 */
export const renderChartInput = {
  spec: z
    .object({
      type: z.enum(CHART_TYPE_TUPLE),
      data: flexibleDataSchema,
      theme: z.enum(THEME_TUPLE).optional(),
      title: z.string().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    })
    .passthrough()
    .describe('A Chartlite ChartSpec: { type, data, ...options }.'),
};

export type ToolResult = CallToolResult;

/** Render a chart spec to SVG. Returns a tool error (not a throw) on bad input. */
export function renderChartResult(spec: ChartSpec): ToolResult {
  try {
    const svg = renderToString(spec);
    return { content: [{ type: 'text', text: svg }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error rendering chart: ${message}` }],
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
