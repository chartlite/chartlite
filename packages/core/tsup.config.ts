import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Single source of truth: the package version is injected at build time so the
// exported `VERSION` constant can never drift from package.json.
const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8')
);

export default defineConfig({
  // Separate entry points so bundlers tree-shake interactivity independently of
  // core — importing '@chartlite/core' never pulls in the /interactive bytes.
  entry: ['src/index.ts', 'src/interactive/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  define: {
    __CHARTLITE_VERSION__: JSON.stringify(pkg.version),
  },
});
