import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tooltip } from '@chartlite/core/interactive';
import { chart } from '../src';

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

function fixedTooltips(): HTMLElement[] {
  return [...document.body.querySelectorAll('div')].filter((el) => el.style.position === 'fixed');
}

function point(node: HTMLElement): Element {
  const el = node.querySelector('.data-point');
  if (!el) throw new Error('expected a data point');
  return el;
}

describe('@chartlite/svelte use:chart', () => {
  let node: HTMLDivElement;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an SVG into the host element', () => {
    const action = chart(node, { type: 'line', data });
    expect(node.querySelector('svg')).toBeTruthy();
    expect(action.chart).toBeTruthy();
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

  it('recreates the chart when update() changes the type', () => {
    const action = chart(node, { type: 'bar', data });
    expect(node.querySelector('rect.bar')).toBeTruthy();
    action.update({ type: 'line', data: [{ x: 'A', y: 1 }, { x: 'B', y: 2 }] });
    expect(node.querySelector('svg')).toBeTruthy();
    expect(node.querySelector('rect.bar')).toBeFalsy();
    action.destroy();
  });

  it('calls chart.update() when only data changes', () => {
    const action = chart(node, { type: 'line', data });
    const instance = action.chart;
    const update = vi.spyOn(instance!, 'update');
    const svg = node.querySelector('svg');

    action.update({ type: 'line', data: [...data, { x: 'Apr', y: 40 }] });
    expect(update).toHaveBeenCalledTimes(1);
    expect(action.chart).toBe(instance);
    expect(node.querySelector('svg')).toBe(svg);
    expect(node.querySelectorAll('.data-point')).toHaveLength(4);

    // Equal-but-new data is a no-op.
    action.update({ type: 'line', data: [...data, { x: 'Apr', y: 40 }] });
    expect(update).toHaveBeenCalledTimes(1);
    action.destroy();
  });

  it('recreates the chart when a non-data option changes', () => {
    const action = chart(node, { type: 'line', data, theme: 'default' });
    const instance = action.chart;
    action.update({ type: 'line', data, theme: 'midnight' });
    expect(action.chart).toBeTruthy();
    expect(action.chart).not.toBe(instance);
    action.destroy();
  });

  it('picks up new callback / plugin identities without recreating', () => {
    const first = vi.fn();
    const second = vi.fn();
    const action = chart(node, { type: 'line', data, onPointClick: first, plugins: [tooltip()] });
    const instance = action.chart;
    action.update({ type: 'line', data, onPointClick: second, plugins: [tooltip()] });
    expect(action.chart).toBe(instance);
    point(node).dispatchEvent(new MouseEvent('click'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(expect.objectContaining({ x: 'Jan', y: 10 }));
    action.destroy();
  });

  it('`tooltip: true` adds the tooltip plugin', () => {
    const action = chart(node, { type: 'line', data, tooltip: true });
    point(node).dispatchEvent(new MouseEvent('mouseenter'));
    expect(fixedTooltips()).toHaveLength(1);
    expect(fixedTooltips()[0].textContent).toContain('Jan: 10');
    action.destroy();
    // The tooltip element is cleaned up with the chart.
    expect(fixedTooltips()).toHaveLength(0);
  });

  it('adds callbacks() automatically for onHover', () => {
    const onHover = vi.fn();
    const action = chart(node, { type: 'line', data, onHover });
    point(node).dispatchEvent(new MouseEvent('mouseenter'));
    expect(onHover).toHaveBeenCalledWith(expect.objectContaining({ x: 'Jan' }));
    action.destroy();
  });

  it('destroys the chart on destroy()', () => {
    const action = chart(node, { type: 'pie', data });
    expect(node.querySelector('svg')).toBeTruthy();
    action.destroy();
    expect(node.querySelector('svg')).toBeFalsy();
    expect(action.chart).toBeNull();
  });

  it('shows a fallback and calls onError when the chart throws', () => {
    let captured: Error | null = null;
    chart(node, { type: 'line', data: [], onError: (e) => (captured = e) });
    expect(captured).toBeTruthy();
    expect(node.textContent).toContain('Chart Error');
  });

  it('recovers after an error when valid data arrives', () => {
    const onError = vi.fn();
    const action = chart(node, { type: 'line', data: [], onError });
    expect(onError).toHaveBeenCalledTimes(1);
    action.update({ type: 'line', data, onError });
    expect(node.querySelector('svg')).toBeTruthy();
    expect(node.textContent).not.toContain('Chart Error');
    action.destroy();
  });

  it('errors on an unknown chart type', () => {
    const onError = vi.fn();
    // @ts-expect-error intentionally invalid type
    chart(node, { type: 'donut', data, onError });
    expect(onError.mock.calls[0][0].message).toMatch(/unknown chart type/i);
  });
});
