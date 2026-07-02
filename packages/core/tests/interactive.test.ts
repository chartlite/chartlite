import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import {
  tooltip,
  crosshair,
  legendToggle,
  callbacks,
  interactive,
} from '../src/interactive';
import type { ChartPointEvent, LegendToggleEvent } from '../src/types';

const single = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

const multi = {
  series: [
    { name: 'Revenue', dataKey: 'r' },
    { name: 'Cost', dataKey: 'c' },
  ],
  data: [
    { x: 'Jan', r: 10, c: 5 },
    { x: 'Feb', r: 20, c: 8 },
  ],
};

function fire(el: Element, type: string): void {
  el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: 50, clientY: 50 }));
}

describe('interactive plugins', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
    // clean up any tooltip elements left on body
    document.querySelectorAll('body > div').forEach((d) => {
      if (d !== container) d.remove();
    });
  });

  describe('tooltip()', () => {
    it('shows content on hover and hides on leave', () => {
      new LineChart(container, { data: single, plugins: [tooltip()] }).render();
      const pt = container.querySelector('.data-point')!;

      fire(pt, 'mouseenter');
      const tip = document.querySelector('body > div:last-child') as HTMLDivElement;
      expect(tip.style.display).toBe('block');
      expect(tip.textContent).toContain('Jan');
      expect(tip.textContent).toContain('10');

      fire(pt, 'mouseleave');
      expect(tip.style.display).toBe('none');
    });

    it('honors a custom formatter', () => {
      new LineChart(container, {
        data: single,
        plugins: [tooltip({ formatter: (e) => `V=${e.y}` })],
      }).render();
      const pt = container.querySelector('.data-point')!;
      fire(pt, 'mouseenter');
      const tip = document.querySelector('body > div:last-child') as HTMLDivElement;
      expect(tip.textContent).toBe('V=10');
    });

    it('removes its element on destroy', () => {
      const chart = new LineChart(container, { data: single, plugins: [tooltip()] });
      chart.render();
      const before = document.querySelectorAll('body > div').length;
      chart.destroy();
      const after = document.querySelectorAll('body > div').length;
      expect(after).toBe(before - 1);
    });
  });

  describe('callbacks()', () => {
    it('fires onPointClick with a typed event', () => {
      const clicks: ChartPointEvent[] = [];
      new LineChart(container, {
        data: single,
        onPointClick: (e) => clicks.push(e),
        plugins: [callbacks()],
      }).render();

      const pt = container.querySelector('.data-point')!;
      fire(pt, 'click');
      expect(clicks).toHaveLength(1);
      expect(clicks[0].x).toBe('Jan');
      expect(clicks[0].y).toBe(10);
      expect(clicks[0].seriesIndex).toBe(0);
      expect(clicks[0].element).toBe(pt);
    });

    it('fires onHover with the point then null on leave', () => {
      const events: (ChartPointEvent | null)[] = [];
      new LineChart(container, {
        data: single,
        plugins: [callbacks({ onHover: (e) => events.push(e) })],
      }).render();

      const pt = container.querySelector('.data-point')!;
      fire(pt, 'mouseenter');
      fire(pt, 'mouseleave');
      expect(events).toHaveLength(2);
      expect(events[0]).not.toBeNull();
      expect(events[1]).toBeNull();
    });

    it('does nothing when no handlers are provided', () => {
      // Should not throw and should not attach a pointer cursor.
      new LineChart(container, { data: single, plugins: [callbacks()] }).render();
      const pt = container.querySelector('.data-point') as SVGElement;
      expect(pt.style.cursor).toBe('');
    });
  });

  describe('legendToggle()', () => {
    it('hides a series and fires onLegendToggle on click', () => {
      const toggles: LegendToggleEvent[] = [];
      new BarChart(container, {
        data: multi,
        legend: { show: true },
        onLegendToggle: (e) => toggles.push(e),
        plugins: [legendToggle()],
      }).render();

      const item = container.querySelector('.legend-item[data-series-index="0"]')!;
      const mainSeries0 = container.querySelectorAll(
        'g.chart-main [data-series-index="0"]'
      );
      expect(mainSeries0.length).toBeGreaterThan(0);

      fire(item, 'click');
      expect(toggles).toHaveLength(1);
      expect(toggles[0].hidden).toBe(true);
      expect(toggles[0].seriesIndex).toBe(0);
      mainSeries0.forEach((el) => {
        expect((el as SVGElement).style.display).toBe('none');
      });

      // toggling back shows it again
      fire(item, 'click');
      expect(toggles[1].hidden).toBe(false);
      mainSeries0.forEach((el) => {
        expect((el as SVGElement).style.display).toBe('');
      });
    });
  });

  describe('crosshair()', () => {
    it('adds a hidden crosshair group that appears on hover', () => {
      new LineChart(container, { data: single, plugins: [crosshair()] }).render();
      const group = container.querySelector('.chart-crosshair') as SVGGElement;
      expect(group).toBeTruthy();
      expect(group.style.display).toBe('none');

      const pt = container.querySelector('.data-point')!;
      fire(pt, 'mouseenter');
      expect(group.style.display).toBe('');
      fire(pt, 'mouseleave');
      expect(group.style.display).toBe('none');
    });
  });

  describe('interactive()', () => {
    it('bundles tooltip + callbacks by default', () => {
      const plugins = interactive();
      const names = plugins.map((p) => p.name).sort();
      expect(names).toEqual(['callbacks', 'tooltip']);
    });

    it('adds crosshair and legendToggle when requested', () => {
      const names = interactive({ crosshair: true, legend: true })
        .map((p) => p.name)
        .sort();
      expect(names).toEqual(['callbacks', 'crosshair', 'legendToggle', 'tooltip']);
    });

    it('can disable the tooltip', () => {
      const names = interactive({ tooltip: false }).map((p) => p.name);
      expect(names).not.toContain('tooltip');
    });
  });
});
