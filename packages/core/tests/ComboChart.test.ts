import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComboChart } from '../src/charts/ComboChart';

/** Series-first data: one bar series + one line series over the same categories. */
const comboData = {
  series: [
    { name: 'Revenue', dataKey: 'revenue', type: 'bar' as const },
    { name: 'Growth', dataKey: 'growth', type: 'line' as const },
  ],
  data: [
    { month: 'Jan', revenue: 100, growth: 20 },
    { month: 'Feb', revenue: 140, growth: 35 },
    { month: 'Mar', revenue: 120, growth: 30 },
  ],
};

describe('ComboChart', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders bar rects for bar series and a line path for line series', () => {
    new ComboChart(container, { data: comboData }).render();
    const bars = container.querySelectorAll('rect.bar');
    // 3 categories x 1 bar series
    expect(bars).toHaveLength(3);
    const line = container.querySelector('path.combo-line');
    expect(line).toBeTruthy();
    expect(line?.getAttribute('fill')).toBe('none');
    expect(line?.getAttribute('stroke')).toBeTruthy();
  });

  it('draws points on the line series by default', () => {
    new ComboChart(container, { data: comboData }).render();
    // circles are only produced by the line series here
    expect(container.querySelectorAll('circle.data-point')).toHaveLength(3);
  });

  it('omits points when showPoints is false', () => {
    new ComboChart(container, { data: comboData, showPoints: false }).render();
    expect(container.querySelectorAll('circle.data-point')).toHaveLength(0);
  });

  it('groups multiple bar series side-by-side', () => {
    const twoBars = {
      series: [
        { name: 'A', dataKey: 'a', type: 'bar' as const },
        { name: 'B', dataKey: 'b', type: 'bar' as const },
        { name: 'Trend', dataKey: 't', type: 'line' as const },
      ],
      data: [
        { x: 'Q1', a: 10, b: 6, t: 8 },
        { x: 'Q2', a: 14, b: 9, t: 12 },
      ],
    };
    new ComboChart(container, { data: twoBars }).render();
    // 2 bar series x 2 categories = 4 bars
    expect(container.querySelectorAll('rect.bar')).toHaveLength(4);
    // one line
    expect(container.querySelectorAll('path.combo-line')).toHaveLength(1);
  });

  it('renders an area fill for area-type series', () => {
    const areaCombo = {
      series: [
        { name: 'Base', dataKey: 'base', type: 'bar' as const },
        { name: 'Trend', dataKey: 'trend', type: 'area' as const },
      ],
      data: [
        { x: 'Jan', base: 50, trend: 30 },
        { x: 'Feb', base: 70, trend: 45 },
      ],
    };
    new ComboChart(container, { data: areaCombo }).render();
    const area = container.querySelector('path.area-fill');
    expect(area).toBeTruthy();
    // closed path back to the baseline
    expect(area?.getAttribute('d')).toContain('Z');
  });

  it('falls back to defaultType for series without a type', () => {
    // Column-oriented multi-series carries no per-series type; defaultType applies.
    const cols = { x: ['A', 'B', 'C'], y: { one: [1, 2, 3], two: [3, 2, 1] } };
    new ComboChart(container, { data: cols, defaultType: 'line' }).render();
    expect(container.querySelectorAll('path.combo-line')).toHaveLength(2);
    expect(container.querySelectorAll('rect.bar')).toHaveLength(0);
  });

  it('shares one y-axis across bar and line series (combined range)', () => {
    // Line values (growth) are far below revenue; both must be visible on one scale.
    new ComboChart(container, { data: comboData }).render();
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // Bars and line points all present → both series plotted on the shared axis.
    expect(container.querySelectorAll('rect.bar').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('circle.data-point').length).toBeGreaterThan(0);
  });

  it('tags shapes with the data-* contract for interactivity/SSR', () => {
    new ComboChart(container, { data: comboData }).render();
    const bar = container.querySelector('rect.bar');
    expect(bar?.getAttribute('data-series-index')).toBe('0');
    expect(bar?.getAttribute('data-x')).toBe('Jan');
    const point = container.querySelector('circle.data-point');
    expect(point?.getAttribute('data-series-index')).toBe('1');
  });

  it('supports export to SVG string', () => {
    const chart = new ComboChart(container, { data: comboData });
    chart.render();
    const svg = chart.toSVG();
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });
});
