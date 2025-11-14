/**
 * Performance Benchmarks
 *
 * Tests rendering performance across different data sizes and chart types.
 * Goal: Validate <16ms render time (60fps) for recommended data range (500-2000 points)
 *
 * Run with: npm run bench
 */

import { bench, describe } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import { AreaChart } from '../src/charts/AreaChart';
import { ScatterChart } from '../src/charts/ScatterChart';

// Helper to generate data
function generateData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: `Point ${i}`,
    y: Math.random() * 100,
  }));
}

function generateNumericData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: i,
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

describe('Performance Benchmarks', () => {
  let container: HTMLDivElement;

  // Set up container before each benchmark
  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('LineChart - Single Series', () => {
    bench('100 points - initial render', () => {
      const data = generateData(100);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('500 points - initial render', () => {
      const data = generateData(500);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('1000 points - initial render', () => {
      const data = generateData(1000);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('2000 points - initial render', () => {
      const data = generateData(2000);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('5000 points - initial render', () => {
      const data = generateData(5000);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });
  });

  describe('LineChart - Updates', () => {
    bench('1000 points - update', () => {
      const data1 = generateData(1000);
      const chart = new LineChart(container, { data: data1, animate: false });
      chart.render();

      const data2 = generateData(1000);
      chart.update(data2);

      chart.destroy();
    });

    bench('2000 points - update', () => {
      const data1 = generateData(2000);
      const chart = new LineChart(container, { data: data1, animate: false });
      chart.render();

      const data2 = generateData(2000);
      chart.update(data2);

      chart.destroy();
    });
  });

  describe('LineChart - Multi-Series', () => {
    bench('1000 points - 3 series', () => {
      const data = generateMultiSeriesData(1000, 3);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('1000 points - 5 series', () => {
      const data = generateMultiSeriesData(1000, 5);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('2000 points - 3 series', () => {
      const data = generateMultiSeriesData(2000, 3);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });
  });

  describe('LineChart - Smooth Curves', () => {
    bench('1000 points - smooth curve', () => {
      const data = generateNumericData(1000);
      const chart = new LineChart(container, {
        data,
        curve: 'smooth',
        animate: false
      });
      chart.render();
      chart.destroy();
    });

    bench('2000 points - smooth curve', () => {
      const data = generateNumericData(2000);
      const chart = new LineChart(container, {
        data,
        curve: 'smooth',
        animate: false
      });
      chart.render();
      chart.destroy();
    });
  });

  describe('BarChart', () => {
    bench('100 bars - initial render', () => {
      const data = generateData(100);
      const chart = new BarChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('500 bars - initial render', () => {
      const data = generateData(500);
      const chart = new BarChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('1000 bars - initial render', () => {
      const data = generateData(1000);
      const chart = new BarChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });
  });

  describe('AreaChart', () => {
    bench('1000 points - initial render', () => {
      const data = generateData(1000);
      const chart = new AreaChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('2000 points - initial render', () => {
      const data = generateData(2000);
      const chart = new AreaChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });
  });

  describe('ScatterChart', () => {
    bench('1000 points - initial render', () => {
      const data = generateNumericData(1000);
      const chart = new ScatterChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('2000 points - initial render', () => {
      const data = generateNumericData(2000);
      const chart = new ScatterChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });

    bench('5000 points - initial render', () => {
      const data = generateNumericData(5000);
      const chart = new ScatterChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });
  });

  describe('With Animations', () => {
    bench('1000 points - with animation', () => {
      const data = generateData(1000);
      const chart = new LineChart(container, { data, animate: true });
      chart.render();
      chart.destroy();
    });

    bench('1000 points - without animation', () => {
      const data = generateData(1000);
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      chart.destroy();
    });
  });

  describe('Responsive Behavior', () => {
    bench('1000 points - responsive enabled', () => {
      const data = generateData(1000);
      const chart = new LineChart(container, {
        data,
        animate: false,
        responsive: true
      });
      chart.render();
      chart.destroy();
    });

    bench('1000 points - responsive disabled', () => {
      const data = generateData(1000);
      const chart = new LineChart(container, {
        data,
        animate: false,
        responsive: false
      });
      chart.render();
      chart.destroy();
    });
  });

  describe('Phase 2 Features', () => {
    bench('1000 points - with reference lines', () => {
      const data = generateNumericData(1000);
      const chart = new LineChart(container, {
        data,
        animate: false,
        referenceLines: [
          { axis: 'y', value: 50, label: 'Target' },
          { axis: 'y', value: 75, label: 'Max' },
        ]
      });
      chart.render();
      chart.destroy();
    });

    bench('1000 points - with annotations', () => {
      const data = generateNumericData(1000);
      const chart = new LineChart(container, {
        data,
        animate: false,
        annotations: [
          { x: 500, y: 50, text: 'Event 1' },
          { x: 750, y: 75, text: 'Event 2' },
        ]
      });
      chart.render();
      chart.destroy();
    });

    bench('1000 points - with regions', () => {
      const data = generateNumericData(1000);
      const chart = new LineChart(container, {
        data,
        animate: false,
        regions: [
          { axis: 'x', start: 200, end: 400, label: 'Period 1' },
          { axis: 'y', start: 60, end: 80, label: 'High' },
        ]
      });
      chart.render();
      chart.destroy();
    });
  });
});
