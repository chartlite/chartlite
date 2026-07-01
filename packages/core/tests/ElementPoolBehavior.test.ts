import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import type { DataPoint } from '../src/types';

describe('Element Pool Behavior', () => {
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

  it('should REUSE same SVG on update (pooling always enabled)', () => {
    const chart = new LineChart(container, { data });
    chart.render();
    const originalSvg = container.querySelector('svg');

    chart.update([{ x: 'A', y: 10 }]);
    const updatedSvg = container.querySelector('svg');

    expect(updatedSvg).toBeTruthy();
    expect(updatedSvg).toBe(originalSvg); // SAME SVG element (reused!)
  });
});
