import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BarChart } from '../src/charts/BarChart';

const multi = {
  series: [
    { name: 'A', dataKey: 'a' },
    { name: 'B', dataKey: 'b' },
  ],
  data: [
    { x: 'Q1', a: 10, b: 5 },
    { x: 'Q2', a: 20, b: 5 },
  ],
};

function barsForCategory(container: HTMLElement, x: string): Element[] {
  return Array.from(container.querySelectorAll('rect.data-point')).filter(
    (r) => r.getAttribute('data-x') === x
  );
}

describe('BarChart stacked', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
  });

  it('stacks series vertically when stacked:true (shared x, different y)', () => {
    new BarChart(container, { data: multi, stacked: true }).render();
    expect(container.querySelectorAll('rect.data-point')).toHaveLength(4);

    const q1 = barsForCategory(container, 'Q1');
    expect(q1).toHaveLength(2);
    expect(q1[0].getAttribute('x')).toBe(q1[1].getAttribute('x'));
    expect(q1[0].getAttribute('y')).not.toBe(q1[1].getAttribute('y'));
  });

  it('groups side-by-side by default (different x)', () => {
    new BarChart(container, { data: multi }).render();
    const q1 = barsForCategory(container, 'Q1');
    expect(q1).toHaveLength(2);
    expect(q1[0].getAttribute('x')).not.toBe(q1[1].getAttribute('x'));
  });

  it('scales the y-axis to stacked totals, not individual values', () => {
    // Totals are Q1=15, Q2=25. The tallest single value is 20; a stacked chart must
    // leave headroom for 25, so the top of the tallest segment sits above y=0 region.
    new BarChart(container, { data: multi, stacked: true, height: 300 }).render();
    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent || '');
    // A y tick at/above 25 should exist (nice-ticks include the max).
    expect(texts.some((t) => Number(t) >= 25)).toBe(true);
  });

  it('ignores the flag for single-series data', () => {
    new BarChart(container, {
      data: [
        { x: 'A', y: 5 },
        { x: 'B', y: 8 },
      ],
      stacked: true,
    }).render();
    expect(container.querySelectorAll('rect.data-point')).toHaveLength(2);
  });

  it('supports horizontal stacking (shared y, different x)', () => {
    new BarChart(container, { data: multi, orientation: 'horizontal', stacked: true }).render();
    const q1 = barsForCategory(container, 'Q1');
    expect(q1).toHaveLength(2);
    expect(q1[0].getAttribute('y')).toBe(q1[1].getAttribute('y'));
    expect(q1[0].getAttribute('x')).not.toBe(q1[1].getAttribute('x'));
  });
});
