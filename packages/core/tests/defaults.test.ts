/**
 * Behaviour added in 1.1: layout defaults, automatic legend, row data, nice
 * ticks, point budget, update options, and relaxed color validation.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  PieChart,
  Sparkline,
  calculateNiceTicks,
} from '../src';
import { tickFormatter } from '../src/utils';

const data = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 45 },
  { x: 'Mar', y: 38 },
];

const multi = {
  series: [
    { name: 'Revenue', dataKey: 'revenue' },
    { name: 'Costs', dataKey: 'costs' },
  ],
  data: [
    { x: 'Jan', revenue: 10, costs: 6 },
    { x: 'Feb', revenue: 20, costs: 8 },
  ],
};

const axisLabels = (container: HTMLElement, index: number): string[] =>
  Array.from(container.querySelectorAll('.chart-axis-labels')[index]?.querySelectorAll('text') ?? []).map(
    (t) => t.textContent ?? ''
  );

describe('1.1 defaults', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.unstubAllGlobals();
  });

  describe('SVG root', () => {
    it('is a standalone, block-level SVG', () => {
      new LineChart(container, { data }).render();
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
      expect(svg.style.display).toBe('block');
    });

    it('keeps the requested height when a title and legend are present', () => {
      new LineChart(container, { data: multi, title: 'Revenue', width: 500, height: 300 }).render();
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('height')).toBe('300');
      expect(svg.getAttribute('width')).toBe('500');
    });

    it('render() returns the chart for chaining', () => {
      const chart = new LineChart(container, { data });
      expect(chart.render()).toBe(chart);
    });
  });

  describe('responsive', () => {
    it('observes the container by default', () => {
      const observe = vi.fn();
      vi.stubGlobal('ResizeObserver', class { observe = observe; disconnect() {} });
      new LineChart(container, { data }).render();
      expect(observe).toHaveBeenCalledTimes(1);
    });

    it('does not observe when responsive is false', () => {
      const observe = vi.fn();
      vi.stubGlobal('ResizeObserver', class { observe = observe; disconnect() {} });
      new LineChart(container, { data, responsive: false }).render();
      expect(observe).not.toHaveBeenCalled();
    });

    it('sparklines are fixed-size by default', () => {
      const observe = vi.fn();
      vi.stubGlobal('ResizeObserver', class { observe = observe; disconnect() {} });
      new Sparkline(container, { data: [1, 3, 2] }).render();
      expect(observe).not.toHaveBeenCalled();
    });
  });

  describe('legend', () => {
    it('is shown automatically for multi-series data', () => {
      new LineChart(container, { data: multi }).render();
      const names = Array.from(container.querySelectorAll('.legend-item')).map((g) => g.getAttribute('data-series'));
      expect(names).toEqual(['Revenue', 'Costs']);
    });

    it('is hidden for a single series', () => {
      new LineChart(container, { data }).render();
      expect(container.querySelector('.chart-legend')).toBeNull();
    });

    it('can be turned off with legend: false or show: false', () => {
      new LineChart(container, { data: multi, legend: false }).render();
      expect(container.querySelector('.chart-legend')).toBeNull();
      new LineChart(container, { data: multi, legend: { show: false } }).render();
      expect(container.querySelector('.chart-legend')).toBeNull();
    });

    it('stays hidden for a single series even when enabled', () => {
      new LineChart(container, { data, legend: true }).render();
      expect(container.querySelector('.chart-legend')).toBeNull();
    });

    it('lists pie slices', () => {
      new PieChart(container, { data }).render();
      const names = Array.from(container.querySelectorAll('.legend-item')).map((g) => g.getAttribute('data-series'));
      expect(names).toEqual(['Jan', 'Feb', 'Mar']);
    });

    it('wraps onto more rows instead of overflowing', () => {
      const series = Array.from({ length: 8 }, (_, i) => ({ name: `Long series name ${i}`, dataKey: `s${i}` }));
      const row = Object.fromEntries([['x', 'A'], ...series.map((s, i) => [s.dataKey, i])]);
      new LineChart(container, { data: { series, data: [row] }, width: 400 }).render();
      const ys = new Set(
        Array.from(container.querySelectorAll('.legend-item')).map((g) => g.getAttribute('transform')?.split(',')[1])
      );
      expect(ys.size).toBeGreaterThan(1);
    });
  });

  describe('row data', () => {
    it('treats each numeric column as a series', () => {
      new LineChart(container, {
        data: [
          { month: 'Jan', revenue: 10, costs: 6 },
          { month: 'Feb', revenue: 20, costs: 8 },
        ],
      }).render();
      const lines = container.querySelectorAll('path[data-series-index]');
      expect(Array.from(lines).map((p) => p.getAttribute('data-series'))).toEqual(['revenue', 'costs']);
      expect(axisLabels(container, 1)).toEqual(['Jan', 'Feb']);
    });

    it('explains the accepted formats on invalid data', () => {
      // SAFETY: deliberately invalid input, to exercise runtime validation.
      expect(() => new LineChart(container, { data: 'nope' as never })).toThrow(/row objects/);
    });
  });

  describe('axes', () => {
    it('uses round tick values that cover the data', () => {
      new LineChart(container, { data: [{ x: 'A', y: 3 }, { x: 'B', y: 97 }] }).render();
      const ticks = axisLabels(container, 0).map(Number);
      expect(ticks[0]).toBe(0);
      expect(ticks[ticks.length - 1]).toBe(100);
    });

    it('does not force zero into a line chart far from zero', () => {
      new LineChart(container, { data: [{ x: 'A', y: 1000 }, { x: 'B', y: 1100 }] }).render();
      expect(Number(axisLabels(container, 0)[0].replace(/\D/g, ''))).toBeGreaterThan(0);
    });

    it('always includes zero for bars and areas', () => {
      for (const Chart of [BarChart, AreaChart]) {
        container.innerHTML = '';
        new Chart(container, { data: [{ x: 'A', y: 1000 }, { x: 'B', y: 1100 }] }).render();
        expect(axisLabels(container, 0)[0]).toBe('0');
      }
    });

    it('truncates long category labels with an ellipsis', () => {
      new BarChart(container, {
        data: [
          { x: 'An extremely long category label', y: 1 },
          { x: 'Another extremely long category label', y: 2 },
        ],
        width: 300,
      }).render();
      expect(axisLabels(container, 1).every((l) => l.endsWith('…'))).toBe(true);
    });

    it('formats a linear x axis with xFormatter', () => {
      new ScatterChart(container, {
        data: [{ x: 1, y: 1 }, { x: 5, y: 2 }],
        xFormatter: (v) => `${v}s`,
      }).render();
      expect(axisLabels(container, 1).every((l) => l.endsWith('s'))).toBe(true);
    });
  });

  describe('maxPoints', () => {
    const big = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: Math.sin(i / 20) }));

    it('samples to the budget', () => {
      new LineChart(container, { data: big, maxPoints: 100 }).render();
      expect(container.querySelectorAll('.data-point')).toHaveLength(100);
    });

    it('keeps every point when set to 0', () => {
      new LineChart(container, { data: big, maxPoints: 0 }).render();
      expect(container.querySelectorAll('.data-point')).toHaveLength(1000);
    });

    it('rejects negative budgets', () => {
      expect(() => new LineChart(container, { data, maxPoints: -1 })).toThrow(/maxPoints/);
    });
  });

  describe('update(data, options)', () => {
    it('merges options and re-renders', () => {
      const chart = new LineChart(container, { data, width: 400, height: 200 }).render();
      expect(chart.update(data, { title: 'Updated', height: 250 })).toBe(chart);
      expect(container.querySelector('.chart-title')?.textContent).toBe('Updated');
      expect(container.querySelector('svg')?.getAttribute('height')).toBe('250');
    });

    it('validates the new options', () => {
      const chart = new LineChart(container, { data }).render();
      expect(() => chart.update(data, { colors: ['not a color!'] })).toThrow(/Invalid color/);
    });
  });

  describe('colors', () => {
    it('accepts CSS variables and modern color functions', () => {
      expect(() =>
        new LineChart(container, {
          data: multi,
          colors: ['var(--brand)', 'oklch(0.7 0.1 200)', 'color-mix(in srgb, red 50%, blue)', 'rebeccapurple'],
        }).render()
      ).not.toThrow();
      expect(container.querySelector('path[data-series-index]')?.getAttribute('stroke')).toBe('var(--brand)');
    });
  });

  describe('sparkline variant', () => {
    it('draws an area for variant: "area"', () => {
      new Sparkline(container, { data: [1, 3, 2, 5], variant: 'area' }).render();
      expect(Array.from(container.querySelectorAll('path')).some((p) => p.getAttribute('d')?.endsWith('Z'))).toBe(true);
    });
  });
});

describe('calculateNiceTicks / tickFormatter', () => {
  it('produces 1-2-5 steps without floating-point drift', () => {
    expect(calculateNiceTicks(0.1, 0.3, 2)).toEqual([0.1, 0.2, 0.3]);
    expect(calculateNiceTicks(0, 0.7, 7)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
    expect(calculateNiceTicks(0, 97, 5)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('formats large values compactly and small ones with just enough decimals', () => {
    const compact = new Intl.NumberFormat(undefined, { notation: 'compact' });
    expect(tickFormatter([0, 25000, 50000])(25000)).toBe(compact.format(25000));
    const fixed = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
    expect(tickFormatter([0, 0.5, 1])(0.5)).toBe(fixed.format(0.5));
    expect(tickFormatter([0, 1000, 2000])(2000)).toBe((2000).toLocaleString());
  });
});
