import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import { AreaChart } from '../src/charts/AreaChart';

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
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

describe('CSS-variable theming (cssVars)', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('default (off)', () => {
    it('does not emit --cl-* custom properties or var() colors', () => {
      new LineChart(container, { data }).render();
      const svg = container.querySelector('svg')!;
      expect(svg.style.getPropertyValue('--cl-bg')).toBe('');
      // Series stroke is a plain hex, not a var() reference.
      const path = container.querySelector('path.data-series') || container.querySelector('path');
      expect(path?.getAttribute('stroke')).not.toMatch(/^var\(/);
    });
  });

  describe('enabled', () => {
    it('does NOT set the tokens on the SVG (so an ancestor can override them)', () => {
      // Critical: if the chart set `--cl-*` on the SVG, those inline values would
      // win over any ancestor override and make CSS theming inert. The defaults
      // live in the `var(--cl-*, fallback)` references instead.
      new LineChart(container, { data, cssVars: true, theme: 'midnight' }).render();
      const svg = container.querySelector('svg')!;
      expect(svg.style.getPropertyValue('--cl-bg')).toBe('');
      expect(svg.style.getPropertyValue('--cl-series-0')).toBe('');
    });

    it('references the background through var(--cl-bg)', () => {
      new LineChart(container, { data, cssVars: true }).render();
      const svg = container.querySelector('svg')!;
      expect(svg.style.backgroundColor).toBe('var(--cl-bg, #ffffff)');
    });

    it('renders series colors as var(--cl-series-N, fallback)', () => {
      new LineChart(container, { data, cssVars: true }).render();
      const stroke = container.querySelector('path')?.getAttribute('stroke') || '';
      expect(stroke).toMatch(/^var\(--cl-series-0, #[0-9a-f]{6}\)$/i);
    });

    it('gives each series its own var(--cl-series-N) reference', () => {
      new BarChart(container, { data: multi, cssVars: true }).render();
      const rects = Array.from(container.querySelectorAll('rect'));
      const fills = rects.map((r) => r.getAttribute('fill')).filter(Boolean);
      expect(fills.some((f) => /^var\(--cl-series-0,/.test(f!))).toBe(true);
      expect(fills.some((f) => /^var\(--cl-series-1,/.test(f!))).toBe(true);
    });

    it('uses a custom color as the var fallback', () => {
      new LineChart(container, { data, cssVars: true, colors: ['#ff0000'] }).render();
      expect(container.querySelector('path')?.getAttribute('stroke')).toBe(
        'var(--cl-series-0, #ff0000)'
      );
    });

    it('routes axis grid/text through var(--cl-grid/--cl-text)', () => {
      new LineChart(container, { data, cssVars: true }).render();
      // Axis labels use fill=var(--cl-text, …); grid lines stroke=var(--cl-grid, …).
      const texts = Array.from(container.querySelectorAll('text'));
      expect(texts.some((t) => (t.getAttribute('fill') || '').startsWith('var(--cl-text,'))).toBe(true);
    });

    it('wraps area gradient stops through the series var so CSS re-themes the fill', () => {
      new AreaChart(container, { data, cssVars: true }).render();
      const stop = container.querySelector('linearGradient stop');
      expect(stop?.getAttribute('stop-color')).toMatch(/^var\(--cl-series-0,/);
    });
  });
});
