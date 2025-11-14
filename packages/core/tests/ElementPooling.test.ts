import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import type { DataPoint } from '../src/types';

describe('Element Pooling', () => {
  let container: HTMLDivElement;
  let data: DataPoint[];

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-chart';
    document.body.appendChild(container);

    data = [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 45 },
      { x: 'Mar', y: 38 },
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should work by default (always enabled)', () => {
    const chart = new LineChart(container, {
      data
    });
    chart.render();

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Should have rendered all data points
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(data.length);
  });

  it('should handle updates (pooling always enabled)', () => {
    const chart = new LineChart(container, {
      data,
      title: 'Original'
    });
    chart.render();

    const originalSvg = container.querySelector('svg');
    expect(originalSvg).toBeTruthy();

    // Update with new data
    const newData = [
      { x: 'A', y: 10 },
      { x: 'B', y: 20 },
    ];

    chart.update(newData);

    const updatedSvg = container.querySelector('svg');
    expect(updatedSvg).toBeTruthy();

    // Should have re-rendered
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(newData.length);
  });

  it('should handle multiple updates', () => {
    const chart = new LineChart(container, {
      data
    });
    chart.render();

    // First update
    chart.update([{ x: 'A', y: 10 }]);
    expect(container.querySelectorAll('circle').length).toBe(1);

    // Second update
    chart.update([{ x: 'A', y: 10 }, { x: 'B', y: 20 }]);
    expect(container.querySelectorAll('circle').length).toBe(2);

    // Third update
    chart.update([{ x: 'A', y: 10 }, { x: 'B', y: 20 }, { x: 'C', y: 30 }]);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('should clean up on destroy', () => {
    const chart = new LineChart(container, {
      data
    });
    chart.render();

    chart.destroy();

    // Container should be empty
    expect(container.innerHTML).toBe('');
  });
});
