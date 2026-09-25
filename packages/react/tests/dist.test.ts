// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const dist = new URL('../dist/index.js', import.meta.url);

// Runs against the build output (turbo builds before `test`); skipped when the
// package hasn't been built yet.
describe.skipIf(!existsSync(dist))('@chartlite/react dist', () => {
  const code = existsSync(dist) ? readFileSync(dist, 'utf8') : '';

  it("starts with a 'use client' directive (React Server Components)", () => {
    expect(code.startsWith("'use client';")).toBe(true);
  });

  it('keeps the pure annotations that let bundlers drop unused components', () => {
    expect(code).toMatch(/var LineChart = \/\* @__PURE__ \*\/ forwardRef/);
  });
});
