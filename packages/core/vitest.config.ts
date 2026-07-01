import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Keep the injected VERSION constant defined under the test runner too, so tests
  // exercise the same code path as the build (see tsup.config.ts).
  define: {
    __CHARTLITE_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0-test'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.bench.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/'],
    },
  },
});
