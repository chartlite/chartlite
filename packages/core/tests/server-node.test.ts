// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderToString } from '../src/server';

describe('server DOM shim', () => {
  it('renders regions behind chart data', () => {
    const svg = renderToString({
      type: 'line',
      data: [1, 2, 3],
      regions: [{ axis: 'y', start: 1, end: 2 }],
    });
    expect(svg).toContain('chart-regions');
    expect(svg).toContain('chart-main');
    expect(svg.indexOf('chart-regions')).toBeLessThan(svg.indexOf('chart-main'));
  });
});
