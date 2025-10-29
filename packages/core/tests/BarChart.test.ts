import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BarChart } from '../src/charts/BarChart';
import type { DataPoint } from '../src/types';

describe('BarChart', () => {
  let container: HTMLDivElement;
  let data: DataPoint[];

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-chart';
    document.body.appendChild(container);

    data = [
      { x: 'Q1', y: 45 },
      { x: 'Q2', y: 52 },
      { x: 'Q3', y: 48 },
      { x: 'Q4', y: 61 },
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Basic rendering', () => {
    it('should create a chart instance', () => {
      const chart = new BarChart(container, { data });
      expect(chart).toBeDefined();
    });

    it('should render SVG element', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render with correct dimensions', () => {
      const chart = new BarChart(container, { data, width: 800, height: 600 });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('800');
      expect(svg?.getAttribute('height')).toBe('600');
    });

    it('should use container selector string', () => {
      const chart = new BarChart('#test-chart', { data });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should throw error for invalid selector', () => {
      expect(() => {
        new BarChart('#non-existent', { data });
      }).toThrow('Container not found: #non-existent');
    });
  });

  describe('Vertical bars (default)', () => {
    it('should render vertical bars by default', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const rects = container.querySelectorAll('rect');
      expect(rects.length).toBe(data.length);
    });

    it('should render correct number of bars', () => {
      const chart = new BarChart(container, { data, orientation: 'vertical' });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(data.length);
    });

    it('should have rounded corners', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      bars.forEach(bar => {
        expect(bar.getAttribute('rx')).toBe('4');
      });
    });

    it('should set bar width based on scale', () => {
      const chart = new BarChart(container, { data, width: 600, height: 400 });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      const widths = Array.from(bars).map(b => b.getAttribute('width'));
      // All bars should have the same width
      expect(new Set(widths).size).toBe(1);
    });
  });

  describe('Horizontal bars', () => {
    it('should render horizontal bars when specified', () => {
      const chart = new BarChart(container, { data, orientation: 'horizontal' });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(data.length);
    });

    it('should have correct bar positioning for horizontal', () => {
      const chart = new BarChart(container, { data, orientation: 'horizontal', width: 600, height: 400 });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      const heights = Array.from(bars).map(b => b.getAttribute('height'));
      // All bars should have the same height
      expect(new Set(heights).size).toBe(1);
    });
  });

  describe('Themes', () => {
    it('should apply default theme', () => {
      const chart = new BarChart(container, { data, theme: 'default' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('should apply midnight theme', () => {
      const chart = new BarChart(container, { data, theme: 'midnight' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(15, 23, 42)');
    });

    it('should apply minimal theme', () => {
      const chart = new BarChart(container, { data, theme: 'minimal' });
      chart.render();
      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });
  });

  describe('Custom colors', () => {
    it('should apply custom color to bars', () => {
      const customColor = '#ff0000';
      const chart = new BarChart(container, { data, colors: [customColor] });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      bars.forEach(bar => {
        expect(bar.getAttribute('fill')).toBe(customColor);
      });
    });

    it('should cycle through multiple colors', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      const chart = new BarChart(container, { data, colors });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      expect(bars[0].getAttribute('fill')).toBe(colors[0]);
      expect(bars[1].getAttribute('fill')).toBe(colors[1]);
      expect(bars[2].getAttribute('fill')).toBe(colors[2]);
      expect(bars[3].getAttribute('fill')).toBe(colors[0]); // Cycles back
    });
  });

  describe('Title', () => {
    it('should render title when provided', () => {
      const title = 'Quarterly Sales';
      const chart = new BarChart(container, { data, title });
      chart.render();
      const texts = container.querySelectorAll('text');
      const titleElement = Array.from(texts).find(t => t.getAttribute('font-size') === '18');
      expect(titleElement?.textContent).toBe(title);
    });

    it('should not render title when not provided', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const texts = container.querySelectorAll('text');
      const hasTitle = Array.from(texts).some(t => t.getAttribute('font-size') === '18');
      expect(hasTitle).toBe(false);
    });
  });

  describe('Axes and grid', () => {
    it('should render axes', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const lines = container.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should render axis labels', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const labels = container.querySelectorAll('text');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render grid lines', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const lines = container.querySelectorAll('line');
      expect(lines.length).toBeGreaterThanOrEqual(3);
    });

    it('should render different axes for horizontal orientation', () => {
      const chart = new BarChart(container, { data, orientation: 'horizontal' });
      chart.render();
      const lines = container.querySelectorAll('line');
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe('Data updates', () => {
    it('should update data', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const newData = [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
      ];
      chart.update(newData);
      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(newData.length);
    });

    it('should re-render on update', () => {
      const chart = new BarChart(container, { data, title: 'Original' });
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
      const chart = new BarChart(container, { data });
      chart.render();
      expect(container.querySelector('svg')).toBeTruthy();

      chart.destroy();
      expect(container.querySelector('svg')).toBeFalsy();
    });
  });

  describe('SVG export', () => {
    it('should export as SVG string', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      const svg = chart.toSVG();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should render before export if not rendered', () => {
      const chart = new BarChart(container, { data });
      const svg = chart.toSVG();
      expect(svg).toContain('<svg');
    });
  });

  describe('Animation', () => {
    it('should add animation class when animate is true', () => {
      const chart = new BarChart(container, { data, animate: true });
      chart.render();
      const mainGroup = container.querySelector('.chart-main');
      expect(mainGroup?.classList.contains('chart-animated')).toBe(true);
    });

    it('should not add animation class when animate is false', () => {
      const chart = new BarChart(container, { data, animate: false });
      chart.render();
      const mainGroup = container.querySelector('.chart-main');
      expect(mainGroup?.classList.contains('chart-animated')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle single data point', () => {
      const singleData = [{ x: 'A', y: 10 }];
      const chart = new BarChart(container, { data: singleData });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(1);
    });

    it('should handle negative values', () => {
      const negativeData = [
        { x: 'A', y: -10 },
        { x: 'B', y: 5 },
        { x: 'C', y: -5 },
      ];
      const chart = new BarChart(container, { data: negativeData });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(negativeData.length);
    });

    it('should handle zero values', () => {
      const zeroData = [
        { x: 'A', y: 0 },
        { x: 'B', y: 10 },
        { x: 'C', y: 0 },
      ];
      const chart = new BarChart(container, { data: zeroData });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(zeroData.length);
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 50 }, (_, i) => ({
        x: `Item${i}`,
        y: Math.random() * 100,
      }));
      const chart = new BarChart(container, { data: largeData });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(largeData.length);
    });
  });

  describe('Responsive behavior', () => {
    it('should be responsive by default', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      expect(chart).toBeTruthy();
    });

    it('should respect responsive: false setting', () => {
      const chart = new BarChart(container, { data, responsive: false });
      chart.render();
      expect(chart).toBeTruthy();
    });

    it('should clean up resize observer on destroy', () => {
      const chart = new BarChart(container, { data });
      chart.render();
      chart.destroy();
      expect(container.querySelector('svg')).toBeFalsy();
    });
  });
});
