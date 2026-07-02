import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PieChart } from '../src/charts/PieChart';

describe('PieChart', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const data = [
    { x: 'A', y: 30 },
    { x: 'B', y: 50 },
    { x: 'C', y: 20 },
  ];

  it('renders one focusable slice path per non-zero value', () => {
    new PieChart(container, { data }).render();
    const slices = container.querySelectorAll('path.data-point');
    expect(slices).toHaveLength(3);
    slices.forEach((s) => {
      expect(s.getAttribute('tabindex')).toBe('-1');
      expect(s.getAttribute('d')).toBeTruthy();
    });
  });

  it('labels each slice with its category and percentage for screen readers', () => {
    new PieChart(container, { data }).render();
    const labels = Array.from(container.querySelectorAll('path.data-point')).map((s) =>
      s.getAttribute('aria-label')
    );
    // 30 / 100 = 30.0%, 50 => 50.0%, 20 => 20.0%
    expect(labels[0]).toBe('A: 30 (30.0%)');
    expect(labels[1]).toBe('B: 50 (50.0%)');
    expect(labels[2]).toBe('C: 20 (20.0%)');
  });

  it('skips zero-value slices', () => {
    new PieChart(container, {
      data: [
        { x: 'A', y: 40 },
        { x: 'B', y: 0 },
        { x: 'C', y: 60 },
      ],
    }).render();
    expect(container.querySelectorAll('path.data-point')).toHaveLength(2);
  });

  it('renders a single 100% slice as a full disc', () => {
    new PieChart(container, { data: [{ x: 'Only', y: 5 }] }).render();
    const slices = container.querySelectorAll('path.data-point');
    expect(slices).toHaveLength(1);
    expect(slices[0].getAttribute('aria-label')).toBe('Only: 5 (100.0%)');
    // Full-circle path uses arc commands, not a center wedge
    expect(slices[0].getAttribute('d')).toContain('A');
  });

  it('supports donut mode via innerRadius', () => {
    new PieChart(container, { data, innerRadius: 0.5 }).render();
    const slices = container.querySelectorAll('path.data-point');
    expect(slices).toHaveLength(3);
    // Donut segments contain a line to the inner arc
    expect(slices[0].getAttribute('d')).toContain('L');
  });

  it('renders percentage labels when showLabels is enabled', () => {
    new PieChart(container, { data, showLabels: true }).render();
    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts).toContain('30.0%');
    expect(texts).toContain('50.0%');
    expect(texts).toContain('20.0%');
  });

  it('does not render labels by default', () => {
    new PieChart(container, { data }).render();
    // Only the accessibility data-table lives in a foreignObject; no percentage <text>
    const percentTexts = Array.from(container.querySelectorAll('text')).filter((t) =>
      /%$/.test(t.textContent || '')
    );
    expect(percentTexts).toHaveLength(0);
  });

  it('applies custom colors in order', () => {
    new PieChart(container, { data, colors: ['#111111', '#222222', '#333333'] }).render();
    const fills = Array.from(container.querySelectorAll('path.data-point')).map((s) =>
      s.getAttribute('fill')
    );
    expect(fills).toEqual(['#111111', '#222222', '#333333']);
  });

  it('renders nothing for all-zero data but still produces an SVG', () => {
    new PieChart(container, {
      data: [
        { x: 'A', y: 0 },
        { x: 'B', y: 0 },
      ],
    }).render();
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('path.data-point')).toHaveLength(0);
  });

  it('sets an accessible role and label on the SVG', () => {
    new PieChart(container, { data, title: 'Market share' }).render();
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toContain('pie chart');
  });

  it('exports to an SVG string after rendering', () => {
    const chart = new PieChart(container, { data });
    chart.render();
    const svg = chart.toSVG();
    expect(svg).toContain('<svg');
    expect(svg).toContain('data-point');
  });
});
