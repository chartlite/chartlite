import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Sparkline } from '../src/charts/Sparkline';

describe('Sparkline', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const values = [3, 7, 4, 9, 6, 11, 8];

  it('renders a compact SVG with a default size and no axes', () => {
    new Sparkline(container, { data: values }).render();
    const svg = container.querySelector('svg')!;
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('120');
    expect(svg.getAttribute('height')).toBe('32');
    // No axis labels/gridlines: a sparkline has just the line (+ end dot)
    expect(container.querySelector('.sparkline-line')).toBeTruthy();
  });

  it('draws an end dot by default and can disable it', () => {
    new Sparkline(container, { data: values }).render();
    expect(container.querySelector('.sparkline-end-dot')).toBeTruthy();

    container.innerHTML = '';
    new Sparkline(container, { data: values, showEndDot: false }).render();
    expect(container.querySelector('.sparkline-end-dot')).toBeNull();
  });

  it('renders a filled area for type "area"', () => {
    new Sparkline(container, { data: values, type: 'area' }).render();
    const paths = container.querySelectorAll('path');
    // area fill + line = at least two paths, one of which is closed (Z)
    const closed = Array.from(paths).some((p) => /Z\s*$/.test(p.getAttribute('d') || ''));
    expect(closed).toBe(true);
  });

  it('respects a custom size', () => {
    new Sparkline(container, { data: values, width: 200, height: 48 }).render();
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('200');
    expect(svg.getAttribute('height')).toBe('48');
  });

  it('handles a flat series without producing NaN coordinates', () => {
    new Sparkline(container, { data: [5, 5, 5, 5] }).render();
    const d = container.querySelector('.sparkline-line')?.getAttribute('d') || '';
    expect(d).not.toContain('NaN');
    expect(d.length).toBeGreaterThan(0);
  });

  it('handles a single data point (dot only, no line)', () => {
    new Sparkline(container, { data: [42] }).render();
    expect(container.querySelector('.sparkline-end-dot')).toBeTruthy();
    // A single point has no line segment
    expect(container.querySelector('.sparkline-line')).toBeNull();
  });

  it('keeps the accessible SVG role and label from the base chart', () => {
    new Sparkline(container, { data: values }).render();
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toContain('sparkline chart');
  });

  it('uses a custom color when provided', () => {
    new Sparkline(container, { data: values, colors: ['#abcdef'] }).render();
    expect(container.querySelector('.sparkline-line')?.getAttribute('stroke')).toBe('#abcdef');
  });
});
