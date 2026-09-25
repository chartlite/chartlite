import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RadialChart } from '../src/charts/RadialChart';

function dataArcPath(container: HTMLElement): string {
  const path = container.querySelector('path.data-point')?.getAttribute('d');
  if (!path) throw new Error('Expected a radial data arc');
  return path;
}

describe('RadialChart', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders a value arc + center label for a single value', () => {
    new RadialChart(container, { data: [{ x: 'Score', y: 72 }], max: 100 }).render();
    const arcs = container.querySelectorAll('path.data-point');
    expect(arcs).toHaveLength(1);
    expect(arcs[0].getAttribute('aria-label')).toContain('72%');
    expect(arcs[0].getAttribute('tabindex')).toBe('-1');
    // center value label
    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts).toContain('72');
  });

  it('draws a faint track behind the value arc', () => {
    new RadialChart(container, { data: [{ x: 'Score', y: 40 }] }).render();
    // track (aria-hidden) + value arc
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('path[aria-hidden="true"]')).toBeTruthy();
  });

  it('renders one arc per data point (multi-ring) with no center label', () => {
    new RadialChart(container, {
      data: [
        { x: 'A', y: 80 },
        { x: 'B', y: 55 },
        { x: 'C', y: 30 },
      ],
      max: 100,
    }).render();
    expect(container.querySelectorAll('path.data-point')).toHaveLength(3);
    // no center value label for multi-ring (the only text is the legend)
    const texts = Array.from(container.querySelectorAll('text'));
    expect(texts.filter((t) => !t.closest('.chart-legend'))).toHaveLength(0);
    expect(container.querySelectorAll('.legend-item')).toHaveLength(3);
  });

  it('omits the value arc for a zero value', () => {
    new RadialChart(container, {
      data: [
        { x: 'Zero', y: 0 },
        { x: 'Half', y: 50 },
      ],
      max: 100,
    }).render();
    // The zero point uses its track as a focusable hit target for a11y/plugin parity.
    expect(container.querySelectorAll('path.data-point')).toHaveLength(2);
    expect(container.querySelector('[data-y="0"]')).toBeTruthy();
  });

  it('clamps values above max to a full arc', () => {
    new RadialChart(container, { data: [{ x: 'Max', y: 100 }], max: 100 }).render();
    const maxPath = dataArcPath(container);

    container.innerHTML = '';
    new RadialChart(container, { data: [{ x: 'Over', y: 150 }], max: 100 }).render();
    expect(dataArcPath(container)).toBe(maxPath);
    expect(container.querySelector('path.data-point')?.getAttribute('aria-label'))
      .toBe('Over: 150 (100%)');
  });

  it('uses startAngle/endAngle to change the rendered sweep', () => {
    new RadialChart(container, { data: [{ x: 'Speed', y: 60 }], max: 100 }).render();
    const fullSweepPath = dataArcPath(container);

    container.innerHTML = '';
    new RadialChart(container, {
      data: [{ x: 'Speed', y: 60 }],
      max: 100,
      startAngle: -90,
      endAngle: 90,
    }).render();
    expect(dataArcPath(container)).not.toBe(fullSweepPath);
  });
});
