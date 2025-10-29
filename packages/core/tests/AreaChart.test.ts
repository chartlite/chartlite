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

    it('should render area with correct opacity', () => {
      const fillOpacity = 0.5;
      const chart = new AreaChart(container, { data, fillOpacity });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      expect(areaFill?.getAttribute('opacity')).toBe('0.5');
    });

    it('should use default opacity of 0.3', () => {
      const chart = new AreaChart(container, { data });
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
    it('should apply custom color to area and line', () => {
      const customColor = '#ff0000';
      const chart = new AreaChart(container, { data, colors: [customColor] });
      chart.render();
      const areaFill = container.querySelector('.area-fill');
      const areaLine = container.querySelector('.area-line');
      expect(areaFill?.getAttribute('fill')).toBe(customColor);
      expect(areaLine?.getAttribute('stroke')).toBe(customColor);
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

      chart.update([{ x: 'A', y: 10 }]);
      const updatedSvg = container.querySelector('svg');

      expect(updatedSvg).toBeTruthy();
      expect(updatedSvg).not.toBe(originalSvg);
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

    it('should render before export if not rendered', () => {
      const chart = new AreaChart(container, { data });
      const svg = chart.toSVG();
      expect(svg).toContain('<svg');
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
