import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { AreaChart } from '../src/charts/AreaChart';
import { BarChart } from '../src/charts/BarChart';
import { ScatterChart } from '../src/charts/ScatterChart';
import { Sparkline } from '../src/charts/Sparkline';
import { generateDataTableHTML } from '../src/a11y/descriptions';

describe('release regressions', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  it('uses stable semantic chart names and refreshes accessibility on update', () => {
    const chart = new LineChart(container, {
      title: 'Sales',
      data: [{ x: 'A', y: 1 }, { x: 'B', y: 2 }],
    });
    chart.render();
    const svg = container.querySelector('svg')!;

    chart.update([{ x: 'A', y: 2 }, { x: 'B', y: 3 }, { x: 'C', y: 4 }]);

    expect(container.querySelector('svg')).toBe(svg);
    expect(svg.getAttribute('aria-label')).toBe('line chart: Sales with 3 data points');
    expect(svg.querySelectorAll('title')).toHaveLength(1);
    expect(svg.querySelectorAll('desc')).toHaveLength(1);
    expect(svg.querySelectorAll('foreignObject')).toHaveLength(1);

    svg.dispatchEvent(new FocusEvent('focus'));
    svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(svg.querySelector('[data-focused="true"]')).toBeTruthy();
  });

  it('renders flat line and area series without non-finite geometry', () => {
    new LineChart(container, { data: [0, 0] }).render();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    container.textContent = '';
    new AreaChart(container, { data: [0, 0] }).render();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('keeps nice tick grid lines inside the plot bounds', () => {
    new LineChart(container, { data: [{ x: 'A', y: 310 }] }).render();
    const chartMain = container.querySelector('.chart-main')!;
    const gridLines = chartMain.querySelectorAll('line[opacity="0.3"]');
    gridLines.forEach((line) => {
      expect(Number(line.getAttribute('y1'))).toBeGreaterThanOrEqual(0);
      expect(Number(line.getAttribute('y1'))).toBeLessThanOrEqual(300);
    });
  });

  it('shares the automatic point budget across multiple series', () => {
    const series = ['a', 'b', 'c'].map((dataKey) => ({ name: dataKey, dataKey }));
    const data = Array.from({ length: 1000 }, (_, x) => ({ x, a: x, b: x + 1, c: x + 2 }));
    new LineChart(container, { data: { series, data, xKey: 'x' } }).render();
    expect(container.querySelectorAll('.data-point').length).toBeLessThanOrEqual(500);
  });

  it('renders grouped and stacked negative bars with non-zero geometry', () => {
    new BarChart(container, { data: [{ x: 'Loss', y: -10 }] }).render();
    expect(Number(container.querySelector('[data-y="-10"]')?.getAttribute('height'))).toBeGreaterThan(0);

    container.textContent = '';
    new BarChart(container, {
      stacked: true,
      data: {
        series: [{ name: 'A', dataKey: 'a' }, { name: 'B', dataKey: 'b' }],
        data: [{ x: 'Q1', a: -10, b: 4 }],
      },
    }).render();
    expect(Number(container.querySelector('[data-y="-10"]')?.getAttribute('height'))).toBeGreaterThan(0);

    container.textContent = '';
    new BarChart(container, {
      orientation: 'horizontal',
      data: [{ x: 'Loss', y: -10 }],
    }).render();
    expect(Number(container.querySelector('[data-y="-10"]')?.getAttribute('width'))).toBeGreaterThan(0);
  });

  it('supports a single scatter point and rejects non-numeric x values clearly', () => {
    new ScatterChart(container, { data: [{ x: 5, y: 10 }] }).render();
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    expect(() => {
      new ScatterChart(container, { data: [{ x: 'nope', y: 10 }] }).render();
    }).toThrow('Scatter chart x values must be finite numbers');
  });

  it('gives area and sparkline points the interaction data contract', () => {
    new AreaChart(container, { data: [{ x: 'A', y: -2 }, { x: 'B', y: 3 }] }).render();
    expect(container.querySelectorAll('.data-point')).toHaveLength(2);
    expect(container.querySelector('.data-point')?.getAttribute('data-cx')).not.toBeNull();

    container.textContent = '';
    new Sparkline(container, { data: [1, 2, 3] }).render();
    expect(container.querySelectorAll('.data-point')).toHaveLength(3);
    expect(container.querySelector('.data-point')?.getAttribute('data-series')).toBe('Series 1');
  });

  it('escapes user-controlled values in the hidden accessibility table', () => {
    const html = generateDataTableHTML({
      title: '<img src=x onerror=alert(1)>',
      data: [{ x: '<script>', y: 1 }],
      seriesData: [{ name: 'Series 1', data: [{ x: '<script>', y: 1 }] }],
    });
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img');
  });
});
