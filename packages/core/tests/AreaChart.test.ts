import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AreaChart } from '../src/charts/AreaChart';
import type { DataPoint } from '../src/types';

describe('AreaChart', () => {
  let container: HTMLDivElement;
  let data: DataPoint[];

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-chart';
    document.body.appendChild(container);

    data = [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 45 },
      { x: 'Mar', y: 38 },
      { x: 'Apr', y: 52 },
      { x: 'May', y: 60 },
      { x: 'Jun', y: 55 },
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Area and line rendering', () => {
    it('should render both area fill and line', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      const areaLine = container.querySelector('.area-line');
      expect(areaFill).toBeTruthy();
      expect(areaLine).toBeTruthy();
    });

    it('should render area with correct opacity (flat fill)', () => {
      const fillOpacity = 0.5;
      const chart = new AreaChart(container, { data, fillOpacity, gradient: false });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      expect(areaFill?.getAttribute('opacity')).toBe('0.5');
    });

    it('should use default opacity of 0.3 (flat fill)', () => {
      const chart = new AreaChart(container, { data, gradient: false });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      expect(areaFill?.getAttribute('opacity')).toBe('0.3');
    });

    it('should render closed area path', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      const pathData = areaFill?.getAttribute('d') || '';
      // Closed path should end with Z
      expect(pathData).toContain('Z');
    });
  });

  describe('Line curve styles', () => {
    it('should render linear curve by default', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const areaLine = container.querySelector('.area-line');
      const pathData = areaLine?.getAttribute('d') || '';
      expect(pathData).toContain('L');
    });

    it('should render smooth curve when specified', () => {
      const chart = new AreaChart(container, { data, curve: 'smooth' });
      chart.render();
      const areaLine = container.querySelector('.area-line');
      const pathData = areaLine?.getAttribute('d') || '';
      expect(pathData).toContain('C');
    });
  });

  describe('Custom colors', () => {
    it('should apply custom color to area and line (flat fill)', () => {
      const customColor = '#ff0000';
      const chart = new AreaChart(container, { data, colors: [customColor], gradient: false });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      const areaLine = container.querySelector('.area-line');
      expect(areaFill?.getAttribute('fill')).toBe(customColor);
      expect(areaLine?.getAttribute('stroke')).toBe(customColor);
    });
  });

  describe('Gradient fills', () => {
    it('fills the area with a gradient by default', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      // Fill references a <linearGradient> via url(#...), not a flat color.
      expect(areaFill?.getAttribute('fill')).toMatch(/^url\(#cl-area-grad-/);
      // No flat opacity attribute — the gradient stops carry the alpha.
      expect(areaFill?.getAttribute('opacity')).toBeNull();
    });

    it('defines a vertical linearGradient with two stops', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const gradient = container.querySelector('linearGradient');
      expect(gradient).toBeTruthy();
      expect(gradient?.getAttribute('y1')).toBe('0');
      expect(gradient?.getAttribute('y2')).toBe('1');
      const stops = container.querySelectorAll('linearGradient stop');
      expect(stops).toHaveLength(2);
      // Top stop uses fillOpacity, bottom fades to transparent.
      expect(stops[0].getAttribute('stop-opacity')).toBe('0.3');
      expect(stops[1].getAttribute('stop-opacity')).toBe('0');
    });

    it('uses the series color as the gradient stop color', () => {
      const customColor = '#ff0000';
      const chart = new AreaChart(container, { data, colors: [customColor] });
      chart.render();
      const stops = container.querySelectorAll('linearGradient stop');
      expect(stops[0].getAttribute('stop-color')).toBe(customColor);
      expect(stops[1].getAttribute('stop-color')).toBe(customColor);
    });

    it('gives each series its own gradient (unique ids)', () => {
      const multi = {
        series: [
          { name: 'A', dataKey: 'a' },
          { name: 'B', dataKey: 'b' },
        ],
        data: [
          { x: 'Jan', a: 10, b: 5 },
          { x: 'Feb', a: 20, b: 8 },
        ],
      };
      const chart = new AreaChart(container, { data: multi });
      chart.render();
      const gradients = container.querySelectorAll('linearGradient');
      expect(gradients).toHaveLength(2);
      const ids = Array.from(gradients).map((g) => g.getAttribute('id'));
      expect(new Set(ids).size).toBe(2);
    });

    it('falls back to a flat fill when gradient is disabled', () => {
      const chart = new AreaChart(container, { data, gradient: false });
      chart.render();
      expect(container.querySelector('linearGradient')).toBeNull();
      const areaFill = container.querySelector('.area-fill');
      expect(areaFill?.getAttribute('fill')).not.toMatch(/^url\(/);
      expect(areaFill?.getAttribute('opacity')).toBe('0.3');
    });
  });

});
