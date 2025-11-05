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

  describe('Multi-series support', () => {
    describe('Series-first format', () => {
      it('should render multiple lines', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' },
            { name: 'Series 3', dataKey: 'value3' }
          ],
          data: [
            { month: 'Jan', value1: 30, value2: 45, value3: 25 },
            { month: 'Feb', value1: 40, value2: 50, value3: 30 },
            { month: 'Mar', value1: 35, value2: 48, value3: 28 }
          ]
        };

        const chart = new LineChart(container, { data: multiSeriesData });
        chart.render();

        const paths = container.querySelectorAll('path');
        // Should have 3 line paths (one per series)
        expect(paths.length).toBe(3);
      });

      it('should render legend for multi-series', () => {
        const multiSeriesData = {
          series: [
            { name: 'Revenue', dataKey: 'revenue' },
            { name: 'Costs', dataKey: 'costs' }
          ],
          data: [
            { month: 'Jan', revenue: 100, costs: 60 },
            { month: 'Feb', revenue: 120, costs: 70 }
          ]
        };

        const chart = new LineChart(container, { data: multiSeriesData, showLegend: true });
        chart.render();

        const legend = container.querySelector('.chart-legend');
        expect(legend).toBeTruthy();
      });

      it('should not render legend for single series', () => {
        const chart = new LineChart(container, { data, showLegend: true });
        chart.render();

        const legend = container.querySelector('.chart-legend');
        expect(legend).toBeFalsy();
      });

      it('should auto-assign colors from theme', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { month: 'Jan', value1: 30, value2: 45 },
            { month: 'Feb', value1: 40, value2: 50 }
          ]
        };

        const chart = new LineChart(container, { data: multiSeriesData });
        chart.render();

        const paths = container.querySelectorAll('path');
        // Each path should have a stroke color
        expect(paths[0].getAttribute('stroke')).toBeTruthy();
        expect(paths[1].getAttribute('stroke')).toBeTruthy();
        // Colors should be different
        expect(paths[0].getAttribute('stroke')).not.toBe(paths[1].getAttribute('stroke'));
      });

      it('should use custom series colors', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1', color: '#ff0000' },
            { name: 'Series 2', dataKey: 'value2', color: '#00ff00' }
          ],
          data: [
            { month: 'Jan', value1: 30, value2: 45 },
            { month: 'Feb', value1: 40, value2: 50 }
          ]
        };

        const chart = new LineChart(container, { data: multiSeriesData });
        chart.render();

        const paths = container.querySelectorAll('path');
        expect(paths[0].getAttribute('stroke')).toBe('#ff0000');
        expect(paths[1].getAttribute('stroke')).toBe('#00ff00');
      });

      it('should render points for all series when showPoints is true', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { month: 'Jan', value1: 30, value2: 45 },
            { month: 'Feb', value1: 40, value2: 50 },
            { month: 'Mar', value1: 35, value2: 48 }
          ]
        };

        const chart = new LineChart(container, { data: multiSeriesData, showPoints: true });
        chart.render();

        const circles = container.querySelectorAll('circle');
        // 2 series × 3 data points = 6 circles
        expect(circles.length).toBe(6);
      });
    });

    describe('Column-oriented format', () => {
      it('should render multiple series from column format', () => {
        const columnData = {
          x: ['Q1', 'Q2', 'Q3', 'Q4'],
          y: {
            'Product A': [100, 120, 110, 130],
            'Product B': [80, 90, 95, 100],
            'Product C': [60, 70, 75, 80]
          }
        };

        const chart = new LineChart(container, { data: columnData });
        chart.render();

        const paths = container.querySelectorAll('path');
        expect(paths.length).toBe(3);
      });

      it('should handle single series in column format', () => {
        const columnData = {
          x: ['Q1', 'Q2', 'Q3'],
          y: [100, 120, 110]
        };

        const chart = new LineChart(container, { data: columnData });
        chart.render();

        const paths = container.querySelectorAll('path');
        expect(paths.length).toBe(1);
      });
    });

    describe('Scale and axes', () => {
      it('should combine y-axis ranges from all series', () => {
        const multiSeriesData = {
          series: [
            { name: 'Small', dataKey: 'small' },
            { name: 'Large', dataKey: 'large' }
          ],
          data: [
            { x: 'A', small: 10, large: 100 },
            { x: 'B', small: 15, large: 150 }
          ]
        };

        const chart = new LineChart(container, { data: multiSeriesData });
        chart.render();

        // Y-axis should accommodate both ranges
        const labels = container.querySelectorAll('text');
        const hasLargeValue = Array.from(labels).some(l => {
          const value = parseInt(l.textContent || '0');
          return value >= 150;
        });
        expect(hasLargeValue).toBe(true);
      });

      it('should handle all unique x values from series', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { month: 'Jan', value1: 30, value2: 45 },
            { month: 'Feb', value1: 40, value2: 50 },
            { month: 'Mar', value1: 35 }, // value2 missing
            { month: 'Apr', value2: 55 } // value1 missing
          ]
        };

        const chart = new LineChart(container, { data: multiSeriesData });
        chart.render();

        // Should handle missing values gracefully
        expect(container.querySelector('svg')).toBeTruthy();
      });
    });

    describe('Legend configuration', () => {
      it('should support legend.show config', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { month: 'Jan', value1: 30, value2: 45 }
          ]
        };

        const chart = new LineChart(container, {
          data: multiSeriesData,
          legend: { show: true }
        });
        chart.render();

        const legend = container.querySelector('.chart-legend');
        expect(legend).toBeTruthy();
      });

      it('should position legend based on config', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' }
          ],
          data: [
            { month: 'Jan', value1: 30, value2: 45 }
          ]
        };

        const chart = new LineChart(container, {
          data: multiSeriesData,
          legend: { show: true, position: 'right' }
        });
        chart.render();

        const legend = container.querySelector('.chart-legend');
        expect(legend).toBeTruthy();
      });
    });

    describe('Backward compatibility', () => {
      it('should still work with DataPoint[] format', () => {
        const chart = new LineChart(container, { data });
        chart.render();

        const paths = container.querySelectorAll('path');
        expect(paths.length).toBe(1);
      });

      it('should still work with number array format', () => {
        const numberData = [10, 20, 30, 40, 50];
        const chart = new LineChart(container, { data: numberData });
        chart.render();

        const paths = container.querySelectorAll('path');
        expect(paths.length).toBe(1);
      });
    });
  });
});