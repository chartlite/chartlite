import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { abbreviate, currency, percent, number, formatters } from '../src/utils/formatters';
import { LineChart } from '../src/charts/LineChart';

describe('formatters', () => {
  it('abbreviates large numbers', () => {
    expect(abbreviate(1500)).toBe('1.5K');
    expect(abbreviate(2_300_000)).toBe('2.3M');
    expect(abbreviate(1_000_000_000)).toBe('1B');
    expect(abbreviate(950)).toBe('950');
    expect(abbreviate(2000)).toBe('2K'); // trailing .0 trimmed
    expect(abbreviate(-1500)).toBe('-1.5K');
  });

  it('formats currency', () => {
    expect(currency('USD')(1234.5)).toBe('$1,234.50');
  });

  it('formats percentages from ratios', () => {
    expect(percent()(0.25)).toBe('25%');
  });

  it('formats numbers with separators', () => {
    expect(number()(1234567)).toBe('1,234,567');
  });

  it('exposes a namespace object', () => {
    expect(formatters.abbreviate(1500)).toBe('1.5K');
    expect(typeof formatters.currency).toBe('function');
  });
});

describe('valueFormatter integration', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('applies valueFormatter to y-axis tick labels', () => {
    new LineChart(container, {
      data: [
        { x: 'A', y: 1000 },
        { x: 'B', y: 5000 },
        { x: 'C', y: 10000 },
      ],
      valueFormatter: formatters.abbreviate,
    }).render();

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent || '');
    // At least one y tick should be abbreviated (e.g. "10K", "5K")
    expect(texts.some((t) => /K$/.test(t))).toBe(true);
    // And no raw 5-digit numbers remain on the axis
    expect(texts.some((t) => t === '10000')).toBe(false);
  });

  it('leaves labels as plain numbers when no formatter is given', () => {
    new LineChart(container, {
      data: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
      ],
    }).render();
    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent || '');
    expect(texts.some((t) => /^\d+$/.test(t))).toBe(true);
  });
});
