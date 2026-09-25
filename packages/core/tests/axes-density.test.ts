import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BarChart } from '../src/charts/BarChart';
import { LineChart } from '../src/charts/LineChart';
import type { DataPoint } from '../src/types';

function makeData(count: number, prefix = 'Category'): DataPoint[] {
  return Array.from({ length: count }, (_, index) => ({
    x: `${prefix} ${index}`,
    y: index + 1,
  }));
}

function categoryTexts(container: HTMLElement, prefix: string): SVGTextElement[] {
  return Array.from(container.querySelectorAll<SVGTextElement>('.chart-axis-labels text'))
    .filter((label) => (label.textContent ?? '').startsWith(prefix));
}

function categoryLabels(container: HTMLElement, prefix: string): string[] {
  return categoryTexts(container, prefix).map((label) => label.textContent ?? '');
}

describe('categorical axis label density', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('retains all labels when the categorical axis is small', () => {
    new LineChart(container, {
      data: makeData(5),
      width: 800,
      height: 600,
    }).render();

    expect(categoryLabels(container, 'Category')).toEqual([
      'Category 0',
      'Category 1',
      'Category 2',
      'Category 3',
      'Category 4',
    ]);
  });

  it('thins 500 x-axis labels but preserves points, the table, and endpoints', () => {
    const data = makeData(500);
    new LineChart(container, {
      data,
      width: 800,
      height: 600,
    }).render();

    const labels = categoryLabels(container, 'Category');
    expect(labels.length).toBeGreaterThanOrEqual(2);
    expect(labels.length).toBeLessThanOrEqual(16);
    expect(labels[0]).toBe('Category 0');
    expect(labels.at(-1)).toBe('Category 499');
    expect(container.querySelectorAll('.data-point')).toHaveLength(data.length);
    expect(container.querySelectorAll('table[aria-label="Chart data table"] tbody tr'))
      .toHaveLength(data.length);
  });

  it('applies the same endpoint-preserving density rule to horizontal categories', () => {
    const data = makeData(500, 'Row');
    new BarChart(container, {
      data,
      orientation: 'horizontal',
      width: 600,
      height: 400,
    }).render();

    const labels = categoryLabels(container, 'Row');
    expect(labels.length).toBeGreaterThanOrEqual(2);
    expect(labels.length).toBeLessThan(data.length / 10);
    // Rows never overlap: consecutive labels sit at least one line apart.
    const ys = categoryTexts(container, 'Row').map((label) => Number(label.getAttribute('y')));
    ys.slice(1).forEach((y, index) => expect(y - ys[index]).toBeGreaterThanOrEqual(12 * 1.4));
    expect(labels[0]).toBe('Row 0');
    expect(labels.at(-1)).toBe('Row 499');
    expect(container.querySelectorAll('.data-point')).toHaveLength(data.length);
    expect(container.querySelectorAll('table[aria-label="Chart data table"] tbody tr'))
      .toHaveLength(data.length);
  });
});
