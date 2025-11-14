/**
 * Accessibility Tests - ARIA Labels and Roles
 * Tests for WCAG 2.1 AA compliance
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import { AreaChart } from '../src/charts/AreaChart';
import { ScatterChart } from '../src/charts/ScatterChart';

describe('Accessibility - ARIA Labels and Roles', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('SVG Semantic Structure', () => {
    it('should have proper ARIA role on SVG element', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'Jan', y: 10 },
          { x: 'Feb', y: 20 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('role')).toBe('img');
      expect(svg?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have descriptive aria-label with chart type and data points', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
        title: 'Test Chart',
      });
      chart.render();

      const svg = container.querySelector('svg');
      const ariaLabel = svg?.getAttribute('aria-label');

      expect(ariaLabel).toContain('line chart');
      expect(ariaLabel).toContain('Test Chart');
      expect(ariaLabel).toContain('3 data points');
    });

    it('should include series count in aria-label for multi-series charts', () => {
      const chart = new LineChart(container, {
        data: {
          series: [
            { name: 'Revenue', dataKey: 'revenue' },
            { name: 'Cost', dataKey: 'cost' },
          ],
          data: [
            { month: 'Jan', revenue: 100, cost: 50 },
            { month: 'Feb', revenue: 120, cost: 60 },
          ],
        },
      });
      chart.render();

      const svg = container.querySelector('svg');
      const ariaLabel = svg?.getAttribute('aria-label');

      expect(ariaLabel).toContain('2 data series');
    });
  });

  describe('Title and Description Elements', () => {
    it('should have title element in SVG', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'A', y: 10 }],
        title: 'My Chart',
      });
      chart.render();

      const title = container.querySelector('title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('My Chart');
    });

    it('should have default title if none provided', () => {
      const chart = new BarChart(container, {
        data: [{ x: 'A', y: 10 }],
      });
      chart.render();

      const title = container.querySelector('title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toContain('Bar Chart');
    });

    it('should have description element with data summary', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'Jan', y: 10 },
          { x: 'Feb', y: 20 },
          { x: 'Mar', y: 15 },
        ],
      });
      chart.render();

      const desc = container.querySelector('desc');
      expect(desc).toBeTruthy();
      expect(desc?.textContent).toContain('Jan');
      expect(desc?.textContent).toContain('Mar');
      expect(desc?.textContent).toContain('10.00');
      expect(desc?.textContent).toContain('20.00');
    });
  });

  describe('Data Point ARIA Labels - LineChart', () => {
    it('should have aria-label on each data point circle', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const circles = container.querySelectorAll('circle.data-point');
      expect(circles.length).toBe(2);

      circles.forEach((circle) => {
        expect(circle.getAttribute('aria-label')).toBeTruthy();
        expect(circle.getAttribute('role')).toBe('img');
        expect(circle.getAttribute('tabindex')).toBe('-1');
      });
    });

    it('should have descriptive aria-labels with x and y values', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 200 },
        ],
        showPoints: true,
      });
      chart.render();

      const circles = Array.from(container.querySelectorAll('circle.data-point'));
      const firstLabel = circles[0]?.getAttribute('aria-label');
      const secondLabel = circles[1]?.getAttribute('aria-label');

      expect(firstLabel).toContain('Jan');
      expect(firstLabel).toContain('100');
      expect(secondLabel).toContain('Feb');
      expect(secondLabel).toContain('200');
    });

    it('should include series name in multi-series charts', () => {
      const chart = new LineChart(container, {
        data: {
          series: [
            { name: 'Revenue', dataKey: 'revenue' },
            { name: 'Cost', dataKey: 'cost' },
          ],
          data: [
            { month: 'Jan', revenue: 100, cost: 50 },
          ],
        },
        showPoints: true,
      });
      chart.render();

      const circles = Array.from(container.querySelectorAll('circle.data-point'));
      const labels = circles.map(c => c.getAttribute('aria-label'));

      expect(labels.some(l => l?.includes('Revenue'))).toBe(true);
      expect(labels.some(l => l?.includes('Cost'))).toBe(true);
    });
  });

  describe('Data Point ARIA Labels - BarChart', () => {
    it('should have aria-label on each bar', () => {
      const chart = new BarChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
      });
      chart.render();

      const bars = container.querySelectorAll('rect.bar.data-point');
      expect(bars.length).toBe(2);

      bars.forEach((bar) => {
        expect(bar.getAttribute('aria-label')).toBeTruthy();
        expect(bar.getAttribute('role')).toBe('img');
        expect(bar.getAttribute('tabindex')).toBe('-1');
      });
    });

    it('should have descriptive aria-labels for bars', () => {
      const chart = new BarChart(container, {
        data: [
          { x: 'Product A', y: 150 },
          { x: 'Product B', y: 200 },
        ],
      });
      chart.render();

      const bars = Array.from(container.querySelectorAll('rect.bar.data-point'));
      const labels = bars.map(b => b.getAttribute('aria-label'));

      expect(labels[0]).toContain('Product A');
      expect(labels[0]).toContain('150');
      expect(labels[1]).toContain('Product B');
      expect(labels[1]).toContain('200');
    });
  });

  describe('Data Point ARIA Labels - AreaChart', () => {
    it('should have aria-label on area series', () => {
      const chart = new AreaChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
      });
      chart.render();

      const areas = container.querySelectorAll('path.area-fill.data-series');
      expect(areas.length).toBeGreaterThan(0);

      areas.forEach((area) => {
        expect(area.getAttribute('aria-label')).toBeTruthy();
        expect(area.getAttribute('role')).toBe('img');
        expect(area.getAttribute('tabindex')).toBe('-1');
      });
    });

    it('should hide decorative line from screen readers', () => {
      const chart = new AreaChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
      });
      chart.render();

      const lines = container.querySelectorAll('path.area-line');
      lines.forEach((line) => {
        expect(line.getAttribute('aria-hidden')).toBe('true');
        expect(line.getAttribute('role')).toBe('presentation');
      });
    });
  });

  describe('Data Point ARIA Labels - ScatterChart', () => {
    it('should have aria-label on scatter points', () => {
      const chart = new ScatterChart(container, {
        data: [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
      });
      chart.render();

      const points = container.querySelectorAll('.data-point');
      expect(points.length).toBe(2);

      points.forEach((point) => {
        expect(point.getAttribute('aria-label')).toBeTruthy();
        expect(point.getAttribute('role')).toBe('img');
        expect(point.getAttribute('tabindex')).toBe('-1');
      });
    });

    it('should include label text in aria-label if provided', () => {
      const chart = new ScatterChart(container, {
        data: [
          { x: 10, y: 20, label: 'Important Point' },
          { x: 30, y: 40, label: 'Another Point' },
        ],
      });
      chart.render();

      const points = Array.from(container.querySelectorAll('.data-point'));
      const labels = points.map(p => p.getAttribute('aria-label'));

      expect(labels[0]).toContain('Important Point');
      expect(labels[1]).toContain('Another Point');
    });
  });

  describe('Data Table Fallback', () => {
    it('should include accessible data table for single series', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        title: 'Test Chart',
      });
      chart.render();

      const table = container.querySelector('table.sr-only');
      expect(table).toBeTruthy();
      expect(table?.getAttribute('aria-label')).toContain('Chart data table');
    });

    it('should have caption in data table', () => {
      const chart = new BarChart(container, {
        data: [{ x: 'A', y: 10 }],
        title: 'My Chart',
      });
      chart.render();

      const caption = container.querySelector('caption');
      expect(caption).toBeTruthy();
      expect(caption?.textContent).toContain('My Chart');
    });

    it('should have table headers for single series', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'A', y: 10 }],
      });
      chart.render();

      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThanOrEqual(2);

      const headerTexts = Array.from(headers).map(h => h.textContent);
      expect(headerTexts).toContain('Category');
      expect(headerTexts).toContain('Value');
    });

    it('should include all data points in table', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
      });
      chart.render();

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);
    });

    it('should have series headers for multi-series table', () => {
      const chart = new LineChart(container, {
        data: {
          series: [
            { name: 'Revenue', dataKey: 'revenue' },
            { name: 'Cost', dataKey: 'cost' },
          ],
          data: [
            { month: 'Jan', revenue: 100, cost: 50 },
          ],
        },
      });
      chart.render();

      const table = container.querySelector('table.sr-only');
      const tableHTML = table?.innerHTML || '';

      expect(tableHTML).toContain('Revenue');
      expect(tableHTML).toContain('Cost');
    });
  });

  describe('Accessibility Styles', () => {
    it('should inject accessibility styles into document head', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'A', y: 10 }],
      });
      chart.render();

      const style = document.getElementById('chartlite-a11y-styles');
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain('.sr-only');
      expect(style?.textContent).toContain('focus-visible');
    });

    it('should only inject styles once (not duplicate)', () => {
      const chart1 = new LineChart(container, {
        data: [{ x: 'A', y: 10 }],
      });
      chart1.render();

      const chart2 = new BarChart(container, {
        data: [{ x: 'B', y: 20 }],
      });
      chart2.render();

      const styles = document.querySelectorAll('#chartlite-a11y-styles');
      expect(styles.length).toBe(1);
    });
  });
});
