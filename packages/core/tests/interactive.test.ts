import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import { PieChart } from '../src/charts/PieChart';
import {
  tooltip,
  crosshair,
  legendToggle,
  callbacks,
  interactive,
} from '../src/interactive';
import type { ChartPointEvent, LegendToggleEvent } from '../src/types';
import { requireElement } from './test-helpers';

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

/** Move the pointer onto a data point (jsdom has no layout, so the SVG sits at 0,0 unscaled). */
function hover(pt: Element): void {
  const main = pt.closest('svg')!.querySelector('g.chart-main')!;
  const [, tx, ty] = /translate\(([\d.-]+),([\d.-]+)\)/.exec(main.getAttribute('transform') ?? '') ?? ['', '0', '0'];
  pt.dispatchEvent(
    new MouseEvent('pointermove', {
      bubbles: true,
      clientX: Number(tx) + Number(pt.getAttribute('data-cx')),
      clientY: Number(ty) + Number(pt.getAttribute('data-cy')),
    })
  );
}

function leave(container: Element): void {
  container.querySelector('svg')!.dispatchEvent(new MouseEvent('pointerleave'));
}

const tipEl = (): HTMLDivElement => requireElement<HTMLDivElement>(document, 'body > div[aria-hidden="true"]');

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

      hover(pt);
      const tip = tipEl();
      expect(tip.style.display).toBe('block');
      expect(tip.textContent).toContain('Jan');
      expect(tip.textContent).toContain('10');

      leave(container);
      expect(tip.style.display).toBe('none');
    });

    it('lists every series at the hovered x', () => {
      new LineChart(container, { data: multi, plugins: [tooltip()] }).render();
      hover(container.querySelector('.data-point[data-index="1"]')!);
      const text = tipEl().textContent ?? '';
      expect(text).toContain('Feb');
      expect(text).toContain('Revenue');
      expect(text).toContain('20');
      expect(text).toContain('Cost');
      expect(text).toContain('8');
    });

    it("formats values with the chart's valueFormatter", () => {
      new LineChart(container, {
        data: single,
        valueFormatter: (v) => `$${v}.00`,
        plugins: [tooltip()],
      }).render();
      hover(container.querySelector('.data-point')!);
      expect(tipEl().textContent).toContain('$10.00');
    });

    it('reveals hidden markers while hovered', () => {
      new LineChart(container, { data: single, showPoints: false, plugins: [tooltip()] }).render();
      const pt = requireElement<SVGElement>(container, '.data-point');
      hover(pt);
      expect(pt.style.fill).not.toBe('');
      leave(container);
      expect(pt.style.fill).toBe('');
    });

    it('describes the hovered bar', () => {
      new BarChart(container, { data: single, plugins: [tooltip()] }).render();
      const bar = container.querySelectorAll('.data-point')[1];
      fire(bar, 'pointermove');
      expect(tipEl().textContent).toContain('Feb');
      expect(tipEl().textContent).toContain('20');
    });

    it('follows keyboard focus', () => {
      new LineChart(container, { data: single, plugins: [tooltip()] }).render();
      const svg = container.querySelector('svg')!;
      fire(svg, 'focus');
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(tipEl().style.display).toBe('block');
      expect(tipEl().textContent).toContain('Jan');
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(tipEl().style.display).toBe('none');
    });

    it('honors a custom formatter', () => {
      new LineChart(container, {
        data: single,
        plugins: [tooltip({ formatter: (e) => `V=${e.y}` })],
      }).render();
      const pt = container.querySelector('.data-point')!;
      hover(pt);
      expect(tipEl().textContent).toBe('V=10');
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
      hover(pt);
      hover(pt); // unchanged point: no duplicate event
      leave(container);
      expect(events).toHaveLength(2);
      expect(events[0]?.x).toBe('Jan');
      expect(events[1]).toBeNull();
    });

    it('does not stack listeners across re-renders', () => {
      const clicks: ChartPointEvent[] = [];
      const chart = new LineChart(container, {
        data: single,
        plugins: [callbacks({ onPointClick: (e) => clicks.push(e) })],
      });
      chart.render();
      chart.render();
      chart.update(single);
      fire(container.querySelector('.data-point')!, 'click');
      expect(clicks).toHaveLength(1);
    });

    it('does nothing when no handlers are provided', () => {
      // Should not throw and should not attach a pointer cursor.
      new LineChart(container, { data: single, plugins: [callbacks()] }).render();
      const pt = requireElement<SVGElement>(container, '.data-point');
      expect(pt.style.cursor).toBe('');
    });

    it('fires point callbacks from keyboard activation', () => {
      const clicks: ChartPointEvent[] = [];
      new LineChart(container, {
        data: single,
        plugins: [callbacks({ onPointClick: (event) => clicks.push(event) })],
      }).render();
      const svg = container.querySelector('svg')!;
      fire(svg, 'focus');
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(clicks).toHaveLength(1);
      expect(clicks[0].x).toBe('Jan');
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
      const mainSeries0 = container.querySelectorAll<SVGElement>(
        'g.chart-main [data-series-index="0"]'
      );
      expect(mainSeries0.length).toBeGreaterThan(0);

      fire(item, 'click');
      expect(toggles).toHaveLength(1);
      expect(toggles[0].hidden).toBe(true);
      expect(toggles[0].seriesIndex).toBe(0);
      mainSeries0.forEach((el) => {
        expect(el.style.display).toBe('none');
      });

      // toggling back shows it again
      fire(item, 'click');
      expect(toggles[1].hidden).toBe(false);
      mainSeries0.forEach((el) => {
        expect(el.style.display).toBe('');
      });
    });

    it('hides a pie slice (and its label) from its legend item', () => {
      new PieChart(container, { data: single, showLabels: true, plugins: [legendToggle()] }).render();
      fire(container.querySelector('.legend-item[data-series-index="1"]')!, 'click');
      const slice = requireElement<SVGElement>(container, '.data-point[data-index="1"]');
      const label = requireElement<SVGElement>(container, 'text[data-index="1"]');
      expect(slice.style.display).toBe('none');
      expect(label.style.display).toBe('none');
      expect(requireElement<SVGElement>(container, '.data-point[data-index="0"]').style.display).toBe('');
    });

    it('exposes button semantics and toggles with the keyboard', () => {
      new BarChart(container, {
        data: multi,
        legend: { show: true },
        plugins: [legendToggle()],
      }).render();
      const item = container.querySelector('.legend-item')!;
      expect(item.getAttribute('role')).toBe('button');
      expect(item.getAttribute('tabindex')).toBe('0');
      item.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(item.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('crosshair()', () => {
    it('adds a hidden crosshair group that appears on hover', () => {
      new LineChart(container, { data: single, plugins: [crosshair()] }).render();
      const group = requireElement<SVGGElement>(container, '.chart-crosshair');
      expect(group).toBeTruthy();
      expect(group.style.display).toBe('none');

      const pt = container.querySelector('.data-point')!;
      hover(pt);
      expect(group.style.display).toBe('');
      expect(group.querySelector('line')?.getAttribute('x1')).toBe(pt.getAttribute('data-cx'));
      leave(container);
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
