import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { chart } from '../src';

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

describe('@chartlite/svelte use:chart', () => {
  let node: HTMLDivElement;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });
  afterEach(() => {
    document.body.removeChild(node);
  });

  it('renders an SVG into the host element', () => {
    const action = chart(node, { type: 'line', data });
    expect(node.querySelector('svg')).toBeTruthy();
    action.destroy();
  });

  it('covers the newer chart types (pie, radial, combo, sparkline)', () => {
    const combo = {
      series: [
        { name: 'Rev', dataKey: 'rev', type: 'bar' as const },
        { name: 'Trend', dataKey: 'trend', type: 'line' as const },
      ],
      data: [
        { x: 'Jan', rev: 10, trend: 4 },
        { x: 'Feb', rev: 20, trend: 8 },
      ],
    };
    const cases = [
      { type: 'pie' as const, data },
      { type: 'radial' as const, data: [{ x: 'Score', y: 70 }], max: 100 },
      { type: 'combo' as const, data: combo },
      { type: 'sparkline' as const, data: [1, 2, 3, 2, 4] },
    ];
    for (const params of cases) {
      const el = document.createElement('div');
      const action = chart(el, params);
      expect(el.querySelector('svg')).toBeTruthy();
      action.destroy();
    }
  });

  it('renders combo bar + line shapes', () => {
    const combo = {
      series: [
        { name: 'A', dataKey: 'a', type: 'bar' as const },
        { name: 'B', dataKey: 'b', type: 'line' as const },
      ],
      data: [
        { x: 'Q1', a: 5, b: 2 },
        { x: 'Q2', a: 8, b: 4 },
      ],
    };
    const action = chart(node, { type: 'combo', data: combo });
    expect(node.querySelector('rect.bar')).toBeTruthy();
    expect(node.querySelector('path.combo-line')).toBeTruthy();
    action.destroy();
  });

  it('recreates the chart when update() is called with new params', () => {
    const action = chart(node, { type: 'bar', data });
    const firstSvg = node.querySelector('svg');
    expect(firstSvg).toBeTruthy();
    action.update({ type: 'line', data: [{ x: 'A', y: 1 }, { x: 'B', y: 2 }] });
    expect(node.querySelector('svg')).toBeTruthy();
    // line chart draws a path stroke; bar does not produce rect.bar anymore
    expect(node.querySelector('rect.bar')).toBeFalsy();
    action.destroy();
  });

  it('destroys the chart on destroy()', () => {
    const action = chart(node, { type: 'pie', data });
    expect(node.querySelector('svg')).toBeTruthy();
    action.destroy();
    expect(node.querySelector('svg')).toBeFalsy();
  });

  it('shows a fallback and calls onError when the chart throws', () => {
    let captured: Error | null = null;
    chart(node, { type: 'line', data: [], onError: (e) => (captured = e) });
    expect(captured).toBeTruthy();
    expect(node.textContent).toContain('Chart Error');
  });

  it('errors on an unknown chart type', () => {
    let captured: Error | null = null;
    // @ts-expect-error intentionally invalid type
    chart(node, { type: 'donut', data, onError: (e) => (captured = e) });
    expect(captured?.message).toMatch(/unknown chart type/i);
  });
});
