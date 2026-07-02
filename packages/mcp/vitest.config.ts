import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Node environment on purpose: this exercises Chartlite's SSR DOM shim (no jsdom),
  // which is exactly how the MCP server runs in production.
  test: {
    environment: 'node',
    globals: true,
  },
});
