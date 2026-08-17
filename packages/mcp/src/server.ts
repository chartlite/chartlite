/**
 * Builds the Chartlite MCP server: two tools over the declarative chart spec.
 * The heavy lifting lives in `./tools`; this file is only the SDK wiring.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CHART_TYPES } from '@chartlite/core/server';
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
        'Zero-dependency, ~15KB, WCAG-accessible SVG output usable directly in HTML/Markdown. ' +
        `Supported types: ${CHART_TYPES.join(', ')}. Call list_chart_types for the full schema.`,
      inputSchema: renderChartInput,
    },
    async ({ spec }) => {
      // Preserve the validated literal discriminator so TypeScript and the core
      // renderer agree on the chart-specific branch. Core decodes the flexible
      // data contract and validates chart options while rendering.
      switch (spec.type) {
        case 'line': return renderChartResult({ ...spec, type: 'line' });
        case 'bar': return renderChartResult({ ...spec, type: 'bar' });
        case 'area': return renderChartResult({ ...spec, type: 'area' });
        case 'scatter': return renderChartResult({ ...spec, type: 'scatter' });
        case 'pie': return renderChartResult({ ...spec, type: 'pie' });
        case 'radial': return renderChartResult({ ...spec, type: 'radial' });
        case 'combo': return renderChartResult({ ...spec, type: 'combo' });
        case 'sparkline': return renderChartResult({ ...spec, type: 'sparkline' });
      }
    }
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
