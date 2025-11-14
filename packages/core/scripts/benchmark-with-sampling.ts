/**
 * Performance Benchmark Script
 *
 * Tests chart rendering with built-in automatic optimizations.
 * All optimizations (element pooling, auto-sampling, etc.) are always enabled.
 */

import { JSDOM } from 'jsdom';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';

// Set up JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document as any;
global.window = dom.window as any;
global.HTMLElement = dom.window.HTMLElement as any;
global.SVGElement = dom.window.SVGElement as any;
global.Element = dom.window.Element as any;
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Helper to generate data
function generateData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: `Point ${i}`,
    y: Math.random() * 100,
  }));
}

function generateMultiSeriesData(count: number, seriesCount: number = 3) {
  const data: any[] = [];
  for (let i = 0; i < count; i++) {
    const point: any = { x: `Point ${i}` };
    for (let s = 0; s < seriesCount; s++) {
      point[`series${s}`] = Math.random() * 100;
    }
    data.push(point);
  }

  const series = Array.from({ length: seriesCount }, (_, i) => ({
    name: `Series ${i}`,
    dataKey: `series${i}`,
  }));

  return { series, data };
}

// Benchmark function
function benchmark(name: string, fn: () => void, iterations: number = 10): number {
  const times: number[] = [];

  // Warm up
  for (let i = 0; i < 3; i++) {
    fn();
  }

  // Measure
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return avg;
}

const TARGET_MS = 50; // Reasonable target for initial render

console.log('\n==============================================');
console.log('📊 Chartlite Performance Benchmark');
console.log('==============================================\n');
console.log('All optimizations enabled automatically:');
console.log('  • Element pooling (always on)');
console.log('  • Auto-sampling (500+ points)');
console.log('  • Animations disabled by default\n');
console.log(`Target: <${TARGET_MS}ms\n`);

// Test cases
const testCases = [
  { points: 100, series: 1, name: 'LineChart 100pts', autoSampled: false },
  { points: 500, series: 1, name: 'LineChart 500pts', autoSampled: false },
  { points: 1000, series: 1, name: 'LineChart 1000pts', autoSampled: true },
  { points: 2000, series: 1, name: 'LineChart 2000pts', autoSampled: true },
  { points: 5000, series: 1, name: 'LineChart 5000pts', autoSampled: true },
  { points: 1000, series: 3, name: 'LineChart 1000pts x3 series', autoSampled: true },
];

interface Result {
  name: string;
  time: number;
  passed: boolean;
  autoSampled: boolean;
}

const results: Result[] = [];

console.log('Render Performance:');
console.log('─'.repeat(80));
console.log(
  'Test'.padEnd(35) +
  'Time'.padEnd(15) +
  'Status'.padEnd(15) +
  'Notes'
);
console.log('─'.repeat(80));

testCases.forEach(({ points, series, name, autoSampled }) => {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);

  const data = series > 1 ? generateMultiSeriesData(points, series) : generateData(points);

  const time = benchmark(name, () => {
    const chart = new LineChart(container, { data });
    chart.render();
    chart.destroy();
  });

  const passed = time < TARGET_MS;
  const status = passed ? '✅ Pass' : '⚠️  Slow';
  const notes = autoSampled ? 'Auto-sampled to 500pts' : '';

  results.push({ name, time, passed, autoSampled });

  console.log(
    name.padEnd(35) +
    `${time.toFixed(2)}ms`.padEnd(15) +
    status.padEnd(15) +
    notes
  );

  container.remove();
});

console.log('─'.repeat(80) + '\n');

// Update performance test
console.log('Update Performance (Element Pooling):');
console.log('─'.repeat(80));

const updateTests = [
  { points: 100, name: 'Update 100pts', autoSampled: false },
  { points: 500, name: 'Update 500pts', autoSampled: false },
  { points: 1000, name: 'Update 1000pts', autoSampled: true },
];

updateTests.forEach(({ points, name, autoSampled }) => {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);

  const data1 = generateData(points);
  const chart = new LineChart(container, { data: data1 });
  chart.render();

  const time = benchmark(name, () => {
    const data2 = generateData(points);
    chart.update(data2);
  }, 5);

  chart.destroy();

  const passed = time < TARGET_MS;
  const status = passed ? '✅ Pass' : '⚠️  Slow';
  const notes = autoSampled ? 'Auto-sampled' : '';

  console.log(
    name.padEnd(35) +
    `${time.toFixed(2)}ms`.padEnd(15) +
    status.padEnd(15) +
    notes
  );

  container.remove();
});

console.log('─'.repeat(80) + '\n');

// Summary
const passing = results.filter(r => r.passed).length;
const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;

console.log('Summary:');
console.log(`  Tests passing <${TARGET_MS}ms: ${passing}/${results.length}`);
console.log(`  Average render time: ${avgTime.toFixed(2)}ms`);
console.log(`  Element pooling: Always enabled`);
console.log(`  Auto-sampling: Kicks in at 500+ points`);
console.log();

console.log('==============================================');
console.log('✅ Benchmark Complete');
console.log('==============================================\n');

process.exit(0);
