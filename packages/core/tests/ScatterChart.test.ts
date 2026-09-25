import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScatterChart } from '../src/charts/ScatterChart';
import type { DataPoint } from '../src/types';

describe('ScatterChart', () => {
  let container: HTMLDivElement;
  let data: DataPoint[];

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-chart';
    document.body.appendChild(container);

    data = [
      { x: 10, y: 30 },
      { x: 20, y: 45 },
      { x: 30, y: 38 },
      { x: 40, y: 52 },
      { x: 50, y: 60 },
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Data points', () => {
    it('should render data points as circles by default', () => {
      const chart = new ScatterChart(container, { data });
      chart.render();
      const circles = container.querySelectorAll('circle.data-point');
      expect(circles.length).toBe(data.length);
    });

    it('should render points with custom size', () => {
      const chart = new ScatterChart(container, { data, pointSize: 10 });
      chart.render();
      const circles = container.querySelectorAll('circle.data-point');
      expect(circles[0].getAttribute('r')).toBe('10');
    });

    it('should render default point size', () => {
      const chart = new ScatterChart(container, { data });
      chart.render();
      const circles = container.querySelectorAll('circle.data-point');
      expect(circles[0].getAttribute('r')).toBe('4');
    });
  });

  describe('Point shapes', () => {
    it('should render circle points', () => {
      const chart = new ScatterChart(container, { data, pointShape: 'circle' });
      chart.render();
      const circles = container.querySelectorAll('circle.data-point');
      expect(circles.length).toBe(data.length);
    });

    it('should render square points', () => {
      const chart = new ScatterChart(container, { data, pointShape: 'square' });
      chart.render();
      const rects = container.querySelectorAll('rect');
      // Expect data.length squares (legend might add additional rects)
      expect(rects.length).toBeGreaterThanOrEqual(data.length);
    });

    it('should render triangle points', () => {
      const chart = new ScatterChart(container, { data, pointShape: 'triangle' });
      chart.render();
      const polygons = container.querySelectorAll('polygon');
      expect(polygons.length).toBe(data.length);
    });
  });

  describe('Point labels', () => {
    it('should not render labels by default', () => {
      const labeledData = data.map((d, i) => ({ ...d, label: `Label ${i}` }));
      const chart = new ScatterChart(container, { data: labeledData });
      chart.render();

      const texts = container.querySelectorAll('text');
      // Only axis labels should exist
      const hasDataLabels = Array.from(texts).some(t =>
        t.textContent?.startsWith('Label')
      );
      expect(hasDataLabels).toBe(false);
    });

    it('should render labels when showLabels is true', () => {
      const labeledData = data.map((d, i) => ({ ...d, label: `Point ${i}` }));
      const chart = new ScatterChart(container, { data: labeledData, showLabels: true });
      chart.render();

      const texts = container.querySelectorAll('text');
      const dataLabels = Array.from(texts).filter(t =>
        t.textContent?.startsWith('Point')
      );
      expect(dataLabels.length).toBe(data.length);
    });

    it('should only render labels for points that have label property', () => {
      const mixedData = [
        { x: 10, y: 30, label: 'A' },
        { x: 20, y: 45 }, // No label
        { x: 30, y: 38, label: 'C' },
      ];
      const chart = new ScatterChart(container, { data: mixedData, showLabels: true });
      chart.render();

      const texts = container.querySelectorAll('text');
      const dataLabels = Array.from(texts).filter(t =>
        t.textContent === 'A' || t.textContent === 'C'
      );
      expect(dataLabels.length).toBe(2);
    });

    it('should position labels on top by default', () => {
      const labeledData = [{ x: 10, y: 30, label: 'Test' }];
      const chart = new ScatterChart(container, { data: labeledData, showLabels: true });
      chart.render();

      const texts = container.querySelectorAll('text');
      const label = Array.from(texts).find(t => t.textContent === 'Test');
      expect(label?.getAttribute('text-anchor')).toBe('middle');
    });

    it('should position labels based on labelPosition config', () => {
      const labeledData = [{ x: 10, y: 30, label: 'Test' }];
      const chart = new ScatterChart(container, {
        data: labeledData,
        showLabels: true,
        labelPosition: 'right'
      });
      chart.render();

      const texts = container.querySelectorAll('text');
      const label = Array.from(texts).find(t => t.textContent === 'Test');
      expect(label?.getAttribute('text-anchor')).toBe('start');
    });
  });

  describe('Custom colors', () => {
    it('should apply custom color to points', () => {
      const customColor = '#ff0000';
      const chart = new ScatterChart(container, { data, colors: [customColor] });
      chart.render();
      const circles = container.querySelectorAll('circle.data-point');
      expect(circles[0].getAttribute('fill')).toBe(customColor);
    });
  });

  describe('Multi-series support', () => {
    describe('Series-first format', () => {
      it('should render multiple series', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' },
          ],
          data: [
            { time: 10, value1: 30, value2: 45 },
            { time: 20, value1: 40, value2: 50 },
            { time: 30, value1: 35, value2: 48 },
          ],
        };

        const chart = new ScatterChart(container, { data: multiSeriesData });
        chart.render();

        const circles = container.querySelectorAll('circle.data-point');
        // Should have 6 points (2 series × 3 data points)
        expect(circles.length).toBe(6);
      });

      it('should render legend for multi-series', () => {
        const multiSeriesData = {
          series: [
            { name: 'Group A', dataKey: 'groupA' },
            { name: 'Group B', dataKey: 'groupB' },
          ],
          data: [
            { time: 10, groupA: 30, groupB: 60 },
            { time: 20, groupA: 40, groupB: 70 },
          ],
        };

        const chart = new ScatterChart(container, {
          data: multiSeriesData,
          legend: { show: true }
        });
        chart.render();

        const legend = container.querySelector('.chart-legend');
        expect(legend).toBeTruthy();
      });

      it('should auto-assign colors from theme', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1' },
            { name: 'Series 2', dataKey: 'value2' },
          ],
          data: [
            { time: 10, value1: 30, value2: 45 },
            { time: 20, value1: 40, value2: 50 },
          ],
        };

        const chart = new ScatterChart(container, { data: multiSeriesData });
        chart.render();

        const circles = container.querySelectorAll('circle.data-point');
        // First two circles should be from series 1, next two from series 2
        const color1 = circles[0].getAttribute('fill');
        const color2 = circles[2].getAttribute('fill');

        expect(color1).toBeTruthy();
        expect(color2).toBeTruthy();
        expect(color1).not.toBe(color2);
      });

      it('should use custom series colors', () => {
        const multiSeriesData = {
          series: [
            { name: 'Series 1', dataKey: 'value1', color: '#ff0000' },
            { name: 'Series 2', dataKey: 'value2', color: '#00ff00' },
          ],
          data: [
            { time: 10, value1: 30, value2: 45 },
          ],
        };

        const chart = new ScatterChart(container, { data: multiSeriesData });
        chart.render();

        const circles = container.querySelectorAll('circle.data-point');
        expect(circles[0].getAttribute('fill')).toBe('#ff0000');
        expect(circles[1].getAttribute('fill')).toBe('#00ff00');
      });
    });

    describe('Column-oriented format', () => {
      it('should render multiple series from column format', () => {
        const columnData = {
          x: [1, 2, 3, 4],
          y: {
            'Set A': [100, 120, 110, 130],
            'Set B': [80, 90, 95, 100],
          },
        };

        const chart = new ScatterChart(container, { data: columnData });
        chart.render();

        const circles = container.querySelectorAll('circle.data-point');
        expect(circles.length).toBe(8); // 2 series × 4 points
      });

      it('should handle single series in column format', () => {
        const columnData = {
          x: [1, 2, 3],
          y: [100, 120, 110],
        };

        const chart = new ScatterChart(container, { data: columnData });
        chart.render();

        const circles = container.querySelectorAll('circle.data-point');
        expect(circles.length).toBe(3);
      });
    });
  });

});
