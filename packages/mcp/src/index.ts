/**
 * `@chartlite/mcp` — a Model Context Protocol server that renders Chartlite charts
 * to SVG from a JSON spec. Run over stdio:
 *
 * ```jsonc
 * // e.g. in an MCP client config
 * { "command": "npx", "args": ["-y", "@chartlite/mcp"] }
 * ```
 */

import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server';

export { createServer } from './server';
export {
  renderChartResult,
  listChartTypesResult,
  renderChartInput,
  CHART_TYPE_TUPLE,
} from './tools';

// Version advertised to MCP clients. Injected at build time from package.json
// (see tsup.config.ts); falls back for ts-node/test.
declare const __MCP_VERSION__: string;
const VERSION = typeof __MCP_VERSION__ !== 'undefined' ? __MCP_VERSION__ : '0.0.0-dev';

async function main(): Promise<void> {
  const server = createServer(VERSION);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Auto-start only when executed as a binary, not when imported for its exports.
const invokedAsBin =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  process.argv[1] === fileURLToPath(import.meta.url);

if (invokedAsBin) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('chartlite-mcp failed to start:', error);
    process.exit(1);
  });
}
