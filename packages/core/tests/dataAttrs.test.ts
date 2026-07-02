import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import { PieChart } from '../src/charts/PieChart';

/**
 * The `data-*` contract that the /interactive plugins read. These attributes are
 * public plumbing — if a rename is needed, the interactivity plugins must move in
 * lockstep, so this test pins the names.
 */
describe('data-point attributes', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
  });

  it('emits x/y/series/index attributes on line points', () => {
    new LineChart(container, {
      data: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
      ],
    }).render();

    const pt = container.querySelector('circle.data-point');
    expect(pt).toBeTruthy();
    expect(pt!.getAttribute('data-x')).toBe('Jan');
    expect(pt!.getAttribute('data-y')).toBe('10');
    expect(pt!.getAttribute('data-series-index')).toBe('0');
    expect(pt!.getAttribute('data-index')).toBe('0');
    // pixel centre for crosshair/tooltip anchoring
    expect(pt!.getAttribute('data-cx')).not.toBeNull();
    expect(pt!.getAttribute('data-cy')).not.toBeNull();
  });

  it('tags the line series path with its series index', () => {
    new LineChart(container, {
      data: {
        series: [
          { name: 'A', dataKey: 'a' },
          { name: 'B', dataKey: 'b' },
        ],
        data: [
          { x: 'Jan', a: 1, b: 2 },
          { x: 'Feb', a: 3, b: 4 },
        ],
      },
    }).render();

    const paths = container.querySelectorAll('path[data-series-index]');
    // one line path per series
    expect(paths.length).toBeGreaterThanOrEqual(2);
    expect(paths[0].getAttribute('data-series')).toBe('A');
  });

  it('emits attributes on bars', () => {
    new BarChart(container, {
      data: [
        { x: 'Q1', y: 5 },
        { x: 'Q2', y: 8 },
      ],
    }).render();
    const bar = container.querySelector('rect.data-point');
    expect(bar!.getAttribute('data-x')).toBe('Q1');
    expect(bar!.getAttribute('data-y')).toBe('5');
  });

  it('emits attributes on pie slices', () => {
    new PieChart(container, {
      data: [
        { x: 'A', y: 30 },
        { x: 'B', y: 70 },
      ],
    }).render();
    const slice = container.querySelector('path.data-point');
    expect(slice!.getAttribute('data-x')).toBe('A');
    expect(slice!.getAttribute('data-y')).toBe('30');
    expect(slice!.getAttribute('data-index')).toBe('0');
  });

  it('marks legend items with class and series index', () => {
    new LineChart(container, {
      data: {
        series: [
          { name: 'Revenue', dataKey: 'r' },
          { name: 'Cost', dataKey: 'c' },
        ],
        data: [
          { x: 'Jan', r: 10, c: 5 },
          { x: 'Feb', r: 20, c: 8 },
        ],
      },
      legend: { show: true },
    }).render();

    const items = container.querySelectorAll('.legend-item');
    expect(items.length).toBe(2);
    expect(items[0].getAttribute('data-series-index')).toBe('0');
    expect(items[0].getAttribute('data-series')).toBe('Revenue');
  });
});
