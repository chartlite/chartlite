import { describe, it, expect } from 'vitest';
import {
  downsampleLTTB,
  downsampleEveryNth,
  autoDownsample,
} from '../src/utils/sampling';
import type { DataPoint } from '../src/types';

function makeData(count: number): DataPoint[] {
  return Array.from({ length: count }, (_, i) => ({ x: i, y: Math.sin(i / 5) * 100 }));
}

describe('downsampleLTTB', () => {
  it('returns the input unchanged when already at or below the threshold', () => {
    const data = makeData(50);
    expect(downsampleLTTB(data, 100)).toBe(data);
    expect(downsampleLTTB(data, 50)).toBe(data);
  });

  it('reduces to exactly the threshold number of points', () => {
    const sampled = downsampleLTTB(makeData(1000), 200);
    expect(sampled).toHaveLength(200);
  });

  it('always preserves the first and last points', () => {
    const data = makeData(1000);
    const sampled = downsampleLTTB(data, 100);
    expect(sampled[0]).toBe(data[0]);
    expect(sampled[sampled.length - 1]).toBe(data[data.length - 1]);
  });

  it('throws when the threshold is below 3 and downsampling is required', () => {
    expect(() => downsampleLTTB(makeData(100), 2)).toThrow('Threshold must be >= 3');
  });

  it('handles string x-values by falling back to index positions', () => {
    const data: DataPoint[] = Array.from({ length: 500 }, (_, i) => ({
      x: `Point ${i}`,
      y: i,
    }));
    const sampled = downsampleLTTB(data, 100);
    expect(sampled).toHaveLength(100);
    expect(sampled[0].x).toBe('Point 0');
    expect(sampled[sampled.length - 1].x).toBe('Point 499');
  });
});

describe('downsampleEveryNth', () => {
  it('returns the input unchanged when already small enough', () => {
    const data = makeData(30);
    expect(downsampleEveryNth(data, 100)).toBe(data);
  });

  it('reduces to the threshold number of points and keeps the last point', () => {
    const data = makeData(1000);
    const sampled = downsampleEveryNth(data, 250);
    expect(sampled).toHaveLength(250);
    expect(sampled[sampled.length - 1]).toBe(data[data.length - 1]);
  });
});

describe('autoDownsample', () => {
  it('returns the original data when under maxPoints', () => {
    const data = makeData(400);
    expect(autoDownsample(data, 500)).toBe(data);
  });

  it('caps large datasets to maxPoints (default lttb)', () => {
    const sampled = autoDownsample(makeData(2000), 500);
    expect(sampled).toHaveLength(500);
  });

  it('supports the fast nth algorithm', () => {
    const sampled = autoDownsample(makeData(2000), 500, 'nth');
    expect(sampled).toHaveLength(500);
    expect(sampled[sampled.length - 1].x).toBe(1999);
  });

  it('never returns more than maxPoints', () => {
    for (const size of [600, 1200, 5000]) {
      expect(autoDownsample(makeData(size), 500).length).toBeLessThanOrEqual(500);
    }
  });
});
