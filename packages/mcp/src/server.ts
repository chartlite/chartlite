/**
 * Builds the Chartlite MCP server: two tools over the declarative chart spec.
 * The heavy lifting lives in `./tools`; this file is only the SDK wiring.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CHART_TYPES, type ChartSpec } from '@chartlite/core/server';
import {
  renderChartInput,
  renderChartResult,
  listChartTypesResult,
} from './tools';

export function createServer(version = '0.0.0'): McpServer {
  const server = new McpServer({ name: 'chartlite', version });

  server.registerTool(
    'render_chart',
    {
      title: 'Render a Chartlite chart',
      description:
        'Render a chart to an SVG string from a declarative spec ({ type, data, ...options }). ' +
        'Zero-dependency, ~13KB, WCAG-accessible SVG output usable directly in HTML/Markdown. ' +
        `Supported types: ${CHART_TYPES.join(', ')}. Call list_chart_types for the full schema.`,
      inputSchema: renderChartInput,
    },
    async ({ spec }) => renderChartResult(spec as ChartSpec)
  );

  server.registerTool(
    'list_chart_types',
    {
      title: 'List chart types and the spec schema',
      description:
        'Return the supported chart types and the JSON Schema for a chart spec, so you can build a valid render_chart call.',
      inputSchema: {},
    },
    async () => listChartTypesResult()
  );

  return server;
}
