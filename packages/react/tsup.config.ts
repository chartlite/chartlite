import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  external: ['react', 'react-dom', '@chartlite/core'],
  minify: false,
  treeshake: false,
  // Mark the package as client-only for React Server Components (Next.js App
  // Router): components use effects/refs, so they must render on the client.
  banner: { js: "'use client';" },
});
