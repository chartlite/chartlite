import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RadialChart } from '../src/charts/RadialChart';

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
    // no center value label for multi-ring
    expect(container.querySelector('text')).toBeNull();
  });

  it('omits the value arc for a zero value', () => {
    new RadialChart(container, {
      data: [
        { x: 'Zero', y: 0 },
        { x: 'Half', y: 50 },
      ],
      max: 100,
    }).render();
    // only the non-zero point yields a data-point arc
    expect(container.querySelectorAll('path.data-point')).toHaveLength(1);
  });

  it('clamps values above max to a full arc', () => {
    new RadialChart(container, { data: [{ x: 'Over', y: 150 }], max: 100 }).render();
    expect(container.querySelectorAll('path.data-point')).toHaveLength(1);
  });

  it('supports a gauge sweep (startAngle/endAngle)', () => {
    new RadialChart(container, {
      data: [{ x: 'Speed', y: 60 }],
      max: 100,
      startAngle: -90,
      endAngle: 90,
    }).render();
    expect(container.querySelector('path.data-point')).toBeTruthy();
  });
});
