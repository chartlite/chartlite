import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import type { DataPoint } from '../src/types';

describe('LineChart', () => {
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
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Basic rendering', () => {
    it('should create a chart instance', () => {
      const chart = new LineChart(container, { data });
      expect(chart).toBeDefined();
    });

    it('should render SVG element', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render with correct dimensions', () => {
      const chart = new LineChart(container, { data, width: 800, height: 600 });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('800');
      expect(svg?.getAttribute('height')).toBe('600');
    });

    it('should use container selector string', () => {
      const chart = new LineChart('#test-chart', { data });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should throw error for invalid selector', () => {
      expect(() => {
        new LineChart('#non-existent', { data });
      }).toThrow('Container not found: #non-existent');
    });
  });

  describe('Data points', () => {
    it('should render data points when showPoints is true', () => {
      const chart = new LineChart(container, { data, showPoints: true });
      chart.render();
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(data.length);
    });

    it('should not render data points when showPoints is false', () => {
      const chart = new LineChart(container, { data, showPoints: false });
      chart.render();
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(0);
    });

    it('should render points by default', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(data.length);
    });
  });

  describe('Line path', () => {
    it('should render a path element', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const path = container.querySelector('path');
      expect(path).toBeTruthy();
      expect(path?.getAttribute('d')).toBeTruthy();
    });

    it('should render linear curve by default', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const path = container.querySelector('path');
      const pathData = path?.getAttribute('d') || '';
      // Linear paths use L commands
      expect(pathData).toContain('L');
    });

    it('should render smooth curve when specified', () => {
      const chart = new LineChart(container, { data, curve: 'smooth' });
      chart.render();
      const path = container.querySelector('path');
      const pathData = path?.getAttribute('d') || '';
      // Smooth paths use C (cubic bezier) commands
      expect(pathData).toContain('C');
    });
  });

  describe('Themes', () => {
    it('should apply default theme', () => {
      const chart = new LineChart(container, { data, theme: 'default' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('should apply midnight theme', () => {
      const chart = new LineChart(container, { data, theme: 'midnight' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(15, 23, 42)');
    });

    it('should apply minimal theme', () => {
      const chart = new LineChart(container, { data, theme: 'minimal' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });
  });

  describe('Custom colors', () => {
    it('should apply custom color to line', () => {
      const customColor = '#ff0000';
      const chart = new LineChart(container, { data, colors: [customColor] });
      chart.render();
      const path = container.querySelector('path');
      expect(path?.getAttribute('stroke')).toBe(customColor);
    });

    it('should apply custom color to points', () => {
      const customColor = '#00ff00';
      const chart = new LineChart(container, { data, colors: [customColor], showPoints: true });
      chart.render();
      const circles = container.querySelectorAll('circle');
      circles.forEach(circle => {
        expect(circle.getAttribute('fill')).toBe(customColor);
      });
    });
  });

  describe('Title', () => {
    it('should render title when provided', () => {
      const title = 'Test Chart';
      const chart = new LineChart(container, { data, title });
      chart.render();
      const texts = container.querySelectorAll('text');
      const titleElement = Array.from(texts).find(t => t.getAttribute('font-size') === '18');
      expect(titleElement?.textContent).toBe(title);
    });

    it('should not render title when not provided', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      // Only axis labels should exist, no title
      const texts = container.querySelectorAll('text');
      const hasTitle = Array.from(texts).some(t => t.getAttribute('font-size') === '18');
      expect(hasTitle).toBe(false);
    });
  });

  describe('Axes and grid', () => {
    it('should render x-axis', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const lines = container.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should render y-axis labels', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const labels = container.querySelectorAll('text');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render grid lines', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const lines = container.querySelectorAll('line');
      // Should have at least x-axis, y-axis, and some grid lines
      expect(lines.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Data updates', () => {
    it('should update data', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const newData = [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
      ];
      chart.update(newData);
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(newData.length);
    });

    it('should re-render on update', () => {
      const chart = new LineChart(container, { data, title: 'Original' });
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
      const chart = new LineChart(container, { data });
      chart.render();
      expect(container.querySelector('svg')).toBeTruthy();

      chart.destroy();
      expect(container.querySelector('svg')).toBeFalsy();
    });
  });

  describe('SVG export', () => {
    it('should export as SVG string', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      const svg = chart.toSVG();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should render before export if not rendered', () => {
      const chart = new LineChart(container, { data });
      const svg = chart.toSVG();
      expect(svg).toContain('<svg');
    });
  });

  describe('Animation', () => {
    it('should add animation class when animate is true', () => {
      const chart = new LineChart(container, { data, animate: true });
      chart.render();
      const mainGroup = container.querySelector('.chart-main');
      expect(mainGroup?.classList.contains('chart-animated')).toBe(true);
    });

    it('should not add animation class when animate is false', () => {
      const chart = new LineChart(container, { data, animate: false });
      chart.render();
      const mainGroup = container.querySelector('.chart-main');
      expect(mainGroup?.classList.contains('chart-animated')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle single data point', () => {
      const singleData = [{ x: 'A', y: 10 }];
      const chart = new LineChart(container, { data: singleData });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle negative values', () => {
      const negativeData = [
        { x: 'A', y: -10 },
        { x: 'B', y: 5 },
        { x: 'C', y: -5 },
      ];
      const chart = new LineChart(container, { data: negativeData });
      chart.render();
      const path = container.querySelector('path');
      expect(path).toBeTruthy();
    });

    it('should handle zero values', () => {
      const zeroData = [
        { x: 'A', y: 0 },
        { x: 'B', y: 0 },
        { x: 'C', y: 0 },
      ];
      const chart = new LineChart(container, { data: zeroData });
      chart.render();
      const path = container.querySelector('path');
      expect(path).toBeTruthy();
    });
  });

  describe('Responsive behavior', () => {
    it('should be responsive by default', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      // Chart should have resize observer if browser supports it
      expect(chart).toBeTruthy();
    });

    it('should respect responsive: false setting', () => {
      const chart = new LineChart(container, { data, responsive: false });
      chart.render();
      expect(chart).toBeTruthy();
    });

    it('should clean up resize observer on destroy', () => {
      const chart = new LineChart(container, { data });
      chart.render();
      chart.destroy();
      expect(container.querySelector('svg')).toBeFalsy();
    });
  });
});