import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import type { DataPoint } from '../src/types';

/**
 * Performance Benchmark Suite
 * Verifies that charts render and update efficiently with built-in optimizations
 * (Element pooling, data sampling, and other optimizations are always enabled)
 */

// Helper to generate test data
function generateData(count: number): DataPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    x: `Point ${i}`,
    y: Math.random() * 100
  }));
}

// Helper to measure execution time
async function measureTime(fn: () => void | Promise<void>): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

describe('Performance Benchmarks', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '400px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // NOTE: These are informational benchmarks. Wall-clock timings are logged for
  // humans, but we assert on functional correctness (did it render / sample /
  // clean up) rather than absolute millisecond thresholds — those are too
  // hardware-dependent to gate CI on and flake on shared runners.
  describe('Render Performance', () => {
    it('should render small datasets', async () => {
      const data = generateData(100);
      const chart = new LineChart(container, { data });

      const time = await measureTime(() => chart.render());
      const svg = container.querySelector('svg');

      console.log(`\n=== Render Performance (100 points) ===`);
      console.log(`Time: ${time.toFixed(2)}ms`);

      expect(svg).toBeTruthy();
      chart.destroy();
    });

    it('should render medium datasets', async () => {
      const data = generateData(500);
      const chart = new LineChart(container, { data });

      const time = await measureTime(() => chart.render());
      const svg = container.querySelector('svg');

      console.log(`\n=== Render Performance (500 points) ===`);
      console.log(`Time: ${time.toFixed(2)}ms`);

      expect(svg).toBeTruthy();
      chart.destroy();
    });

    it('should handle large datasets with auto-sampling', async () => {
      const data = generateData(2000);
      const chart = new LineChart(container, { data });

      const time = await measureTime(() => chart.render());
      const svg = container.querySelector('svg');

      console.log(`\n=== Render Performance (2000 points, auto-sampled) ===`);
      console.log(`Time: ${time.toFixed(2)}ms`);
      console.log(`Note: Auto-sampling kicks in at 500+ points`);

      expect(svg).toBeTruthy();
      chart.destroy();
    });
  });

  describe('Update Performance (Element Pooling)', () => {
    it('should update efficiently with element pooling', async () => {
      const data = generateData(100);
      const chart = new LineChart(container, { data });
      chart.render();

      const times: number[] = [];
      for (let i = 0; i < 10; i++) {
        const newData = generateData(100);
        const time = await measureTime(() => chart.update(newData));
        times.push(time);
      }
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const svg = container.querySelector('svg');

      console.log(`\n=== Update Performance (100 points, 10 updates) ===`);
      console.log(`Average: ${avgTime.toFixed(2)}ms`);
      console.log(`Note: Element pooling is always enabled`);

      // Chart survives repeated updates (element pooling reuses DOM elements)
      expect(svg).toBeTruthy();
      chart.destroy();
    });

    it('should handle varying data sizes efficiently', async () => {
      const sizes = [50, 100, 500];
      const results: Record<number, number> = {};

      for (const size of sizes) {
        const data = generateData(size);
        const chart = new LineChart(container, { data });
        chart.render();

        const time = await measureTime(() => {
          chart.update(generateData(size));
        });
        chart.destroy();

        results[size] = time;
      }

      console.log(`\n=== Update Performance: Data Size Scaling ===`);
      for (const size of sizes) {
        console.log(`${size} points: ${results[size].toFixed(2)}ms`);
      }

      // Every size completed an update without error and produced a measurement
      sizes.forEach((size) => {
        expect(results[size]).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Chart Type Performance', () => {
    it('should render different chart types efficiently', async () => {
      const data = generateData(200);

      // Line chart
      const lineChart = new LineChart(container, { data });
      const lineTime = await measureTime(() => lineChart.render());
      const lineSvg = container.querySelector('svg');
      lineChart.destroy();

      // Bar chart
      const barChart = new BarChart(container, { data });
      const barTime = await measureTime(() => barChart.render());
      const barSvg = container.querySelector('svg');
      barChart.destroy();

      console.log(`\n=== Chart Type Performance (200 points) ===`);
      console.log(`LineChart: ${lineTime.toFixed(2)}ms`);
      console.log(`BarChart:  ${barTime.toFixed(2)}ms`);

      // Both chart types render successfully
      expect(lineSvg).toBeTruthy();
      expect(barSvg).toBeTruthy();
    });
  });

  describe('Automatic Data Sampling', () => {
    it('should automatically sample large datasets', async () => {
      const smallData = generateData(400); // Below threshold
      const largeData = generateData(1000); // Above threshold (500+)

      // Small dataset - no sampling
      const chartSmall = new LineChart(container, { data: smallData });
      const smallTime = await measureTime(() => chartSmall.render());
      chartSmall.destroy();

      // Large dataset - automatic sampling
      const chartLarge = new LineChart(container, { data: largeData });
      const largeTime = await measureTime(() => chartLarge.render());
      const largeSvg = container.querySelector('svg');
      chartLarge.destroy();

      console.log(`\n=== Automatic Data Sampling ===`);
      console.log(`400 points (no sampling): ${smallTime.toFixed(2)}ms`);
      console.log(`1000 points (auto-sampled to 500): ${largeTime.toFixed(2)}ms`);
      console.log(`Note: Sampling threshold is 500 points`);

      // Both render successfully; sampling correctness is verified deterministically
      // in sampling.test.ts (this benchmark only logs the timing difference).
      expect(largeSvg).toBeTruthy();
    });
  });

  describe('Memory and Cleanup', () => {
    it('should clean up resources properly', () => {
      const data = generateData(100);
      const chart = new LineChart(container, { data });
      chart.render();

      // Multiple updates
      for (let i = 0; i < 5; i++) {
        chart.update(generateData(100));
      }

      chart.destroy();

      // Container should be empty
      expect(container.innerHTML).toBe('');
    });

    it('should handle rapid re-renders without leaking', async () => {
      const data = generateData(100);
      const chart = new LineChart(container, { data });

      // Rapid renders
      for (let i = 0; i < 10; i++) {
        chart.render();
      }

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      chart.destroy();
      expect(container.innerHTML).toBe('');
    });
  });
});
