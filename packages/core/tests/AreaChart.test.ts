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

  describe('Basic rendering', () => {
    it('should create a chart instance', () => {
      const chart = new AreaChart(container, { data });
      expect(chart).toBeDefined();
    });

    it('should render SVG element', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render with correct dimensions', () => {
      const chart = new AreaChart(container, { data, width: 800, height: 600 });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('800');
      expect(svg?.getAttribute('height')).toBe('600');
    });

    it('should use container selector string', () => {
      const chart = new AreaChart('#test-chart', { data });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
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

  describe('Themes', () => {
    it('should apply default theme', () => {
      const chart = new AreaChart(container, { data, theme: 'default' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('should apply midnight theme', () => {
      const chart = new AreaChart(container, { data, theme: 'midnight' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(15, 23, 42)');
    });

    it('should apply minimal theme', () => {
      const chart = new AreaChart(container, { data, theme: 'minimal' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(255, 255, 255)');
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

  describe('Title', () => {
    it('should render title when provided', () => {
      const title = 'Revenue Growth';
      const chart = new AreaChart(container, { data, title });
      chart.render();
      const texts = container.querySelectorAll('text');
      const titleElement = Array.from(texts).find(t => t.getAttribute('font-size') === '18');
      expect(titleElement?.textContent).toBe(title);
    });

    it('should not render title when not provided', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const texts = container.querySelectorAll('text');
      const hasTitle = Array.from(texts).some(t => t.getAttribute('font-size') === '18');
      expect(hasTitle).toBe(false);
    });
  });

  describe('Axes and grid', () => {
    it('should render axes', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const lines = container.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should render axis labels', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const labels = container.querySelectorAll('text');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render grid lines', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const lines = container.querySelectorAll('line');
      expect(lines.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Data updates', () => {
    it('should update data', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const newData = [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
        { x: 'C', y: 15 },
      ];
      chart.update(newData);
      const areaFill = container.querySelector('.area-fill');
      expect(areaFill).toBeTruthy();
    });

    it('should re-render on update', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const originalSvg = container.querySelector('svg');
      const originalPaths = container.querySelectorAll('path').length;

      chart.update([{ x: 'A', y: 10 }]);
      const updatedSvg = container.querySelector('svg');
      const updatedPaths = container.querySelectorAll('path').length;

      expect(updatedSvg).toBeTruthy();
      // Element pooling reuses SVG for better performance
      expect(updatedSvg).toBe(originalSvg);
      // But content is updated
      expect(updatedPaths).toBeGreaterThan(0);
      expect(originalPaths).toBeGreaterThan(0);
    });
  });

  describe('Cleanup', () => {
    it('should destroy chart', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      expect(container.querySelector('svg')).toBeTruthy();

      chart.destroy();
      expect(container.querySelector('svg')).toBeFalsy();
    });
  });

  describe('SVG export', () => {
    it('should export as SVG string', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      const svg = chart.toSVG();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should throw error if toSVG called before render', () => {
      const chart = new AreaChart(container, { data });
      expect(() => chart.toSVG()).toThrow('Chart must be rendered before calling toSVG()');
    });
  });

  describe('Animation', () => {
    it('should add animation class when animate is true', () => {
      const chart = new AreaChart(container, { data, animate: true });
      chart.render();
      const mainGroup = container.querySelector('.chart-main');
      expect(mainGroup?.classList.contains('chart-animated')).toBe(true);
    });

    it('should not add animation class when animate is false', () => {
      const chart = new AreaChart(container, { data, animate: false });
      chart.render();
      const mainGroup = container.querySelector('.chart-main');
      expect(mainGroup?.classList.contains('chart-animated')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle single data point', () => {
      const singleData = [{ x: 'A', y: 10 }];
      const chart = new AreaChart(container, { data: singleData });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      expect(areaFill).toBeTruthy();
    });

    it('should handle negative values', () => {
      const negativeData = [
        { x: 'A', y: -10 },
        { x: 'B', y: 5 },
        { x: 'C', y: -5 },
      ];
      const chart = new AreaChart(container, { data: negativeData });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      expect(areaFill).toBeTruthy();
    });

    it('should handle zero values', () => {
      const zeroData = [
        { x: 'A', y: 0 },
        { x: 'B', y: 0 },
        { x: 'C', y: 0 },
      ];
      const chart = new AreaChart(container, { data: zeroData });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      expect(areaFill).toBeTruthy();
    });
  });

  describe('Responsive behavior', () => {
    it('should be responsive by default', () => {
      const chart = new AreaChart(container, { data });
      chart.render();
      expect(chart).toBeTruthy();
    });

    it('should respect responsive: false setting', () => {
      const chart = new AreaChart(container, { data, responsive: false });
      chart.render();
      expect(chart).toBeTruthy();
    });
  });
});
