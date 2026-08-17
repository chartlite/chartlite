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

    it('should use first color for single-series chart', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      const chart = new BarChart(container, { data, colors });
      chart.render();
      const bars = container.querySelectorAll('.bar');
      // In multi-series model, single series uses first color for all bars
      expect(bars[0].getAttribute('fill')).toBe(colors[0]);
      expect(bars[1].getAttribute('fill')).toBe(colors[0]);
      expect(bars[2].getAttribute('fill')).toBe(colors[0]);
      expect(bars[3].getAttribute('fill')).toBe(colors[0]);
    });
  });

  describe('Multi-series support', () => {
    describe('Grouped bars', () => {
      it('should render grouped bars for multiple series', () => {
        const multiSeriesData = {
          series: [
            { name: 'Product A', dataKey: 'productA' },
            { name: 'Product B', dataKey: 'productB' },
            { name: 'Product C', dataKey: 'productC' }
          ],
          data: [
            { quarter: 'Q1', productA: 100, productB: 80, productC: 60 },
            { quarter: 'Q2', productA: 120, productB: 90, productC: 70 },
            { quarter: 'Q3', productA: 110, productB: 85, productC: 65 }
          ]
        };

        const chart = new BarChart(container, { data: multiSeriesData });
        chart.render();

        const bars = container.querySelectorAll('.bar');
        // 3 quarters × 3 products = 9 bars
        expect(bars.length).toBe(9);
      });

      it('should render legend for multi-series bars', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { category: 'A', value1: 50, value2: 70 },
            { category: 'B', value1: 60, value2: 80 }
          ]
        };

        const chart = new BarChart(container, { data: multiSeriesData, legend: { show: true } });
        chart.render();

        const legend = container.querySelector('.chart-legend');
        expect(legend).toBeTruthy();
      });

      it('should auto-assign different colors to each series', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { category: 'A', value1: 50, value2: 70 }
          ]
        };

        const chart = new BarChart(container, { data: multiSeriesData });
        chart.render();

        const bars = container.querySelectorAll('.bar');
        const color1 = bars[0].getAttribute('fill');
        const color2 = bars[1].getAttribute('fill');

        expect(color1).toBeTruthy();
        expect(color2).toBeTruthy();
        expect(color1).not.toBe(color2);
      });

      it('should respect custom series colors', () => {
        const multiSeriesData = {
          series: [
            { name: 'Red', dataKey: 'value1', color: '#ff0000' },
            { name: 'Blue', dataKey: 'value2', color: '#0000ff' }
          ],
          data: [
            { category: 'A', value1: 50, value2: 70 }
          ]
        };

        const chart = new BarChart(container, { data: multiSeriesData });
        chart.render();

        const bars = container.querySelectorAll('.bar');
        expect(bars[0].getAttribute('fill')).toBe('#ff0000');
        expect(bars[1].getAttribute('fill')).toBe('#0000ff');
      });
    });

    describe('Horizontal grouped bars', () => {
      it('should render horizontal grouped bars', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { category: 'A', value1: 50, value2: 70 },
            { category: 'B', value1: 60, value2: 80 }
          ]
        };

        const chart = new BarChart(container, {
          data: multiSeriesData,
          orientation: 'horizontal'
        });
        chart.render();

        const bars = container.querySelectorAll('.bar');
        // 2 categories × 2 series = 4 bars
        expect(bars.length).toBe(4);
      });
    });

    describe('Column-oriented format', () => {
      it('should handle multi-series column format', () => {
        const columnData = {
          x: ['Jan', 'Feb', 'Mar'],
          y: {
            'Revenue': [100, 120, 110],
            'Costs': [60, 70, 65]
          }
        };

        const chart = new BarChart(container, { data: columnData });
        chart.render();

        const bars = container.querySelectorAll('.bar');
        // 3 months × 2 series = 6 bars
        expect(bars.length).toBe(6);
      });
    });

    describe('Scale and spacing', () => {
      it('should combine y-axis ranges from all series', () => {
        const multiSeriesData = {
          series: [
            { name: 'Small', dataKey: 'small' },
            { name: 'Large', dataKey: 'large' }
          ],
          data: [
            { category: 'A', small: 10, large: 200 }
          ]
        };

        const chart = new BarChart(container, { data: multiSeriesData });
        chart.render();

        // Y-axis should accommodate both ranges
        const labels = container.querySelectorAll('text');
        const hasLargeValue = Array.from(labels).some(l => {
          const value = parseInt(l.textContent || '0');
          return value >= 200;
        });
        expect(hasLargeValue).toBe(true);
      });

      it('should space grouped bars appropriately', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { category: 'A', value1: 50, value2: 70 }
          ]
        };

        const chart = new BarChart(container, { data: multiSeriesData });
        chart.render();

        const bars = container.querySelectorAll('.bar');
        const x1 = parseFloat(bars[0].getAttribute('x') || '0');
        const width1 = parseFloat(bars[0].getAttribute('width') || '0');
        const x2 = parseFloat(bars[1].getAttribute('x') || '0');

        // Second bar should be positioned after the first
        expect(x2).toBeGreaterThan(x1);
        expect(x2).toBeLessThan(x1 + width1 * 3); // Within reasonable group spacing
      });
    });

  });
});
