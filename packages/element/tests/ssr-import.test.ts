// @vitest-environment node
import { describe, it, expect } from 'vitest';

describe('@chartlite/element SSR import', () => {
  it('loads without browser globals', async () => {
    const module = await import('../src');
    expect(module.ChartLiteElement).toBeTypeOf('function');
  });
});
