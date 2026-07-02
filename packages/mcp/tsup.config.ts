import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8')
);

export default defineConfig({
  entry: ['src/index.ts'],
  define: {
    __MCP_VERSION__: JSON.stringify(pkg.version),
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node18',
  // The published binary must be directly executable.
  banner: { js: '#!/usr/bin/env node' },
});
