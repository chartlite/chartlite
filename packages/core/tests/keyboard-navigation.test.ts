/**
 * Keyboard Navigation Tests
 * Tests for WCAG 2.1 AA keyboard accessibility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import { AreaChart } from '../src/charts/AreaChart';
import { ScatterChart } from '../src/charts/ScatterChart';

describe('Keyboard Navigation', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    // Clean up live region if created
    const liveRegion = document.getElementById('chartlite-live-region');
    if (liveRegion) {
      document.body.removeChild(liveRegion);
    }
  });

  describe('Chart Focusability', () => {
    it('should make SVG focusable with tabindex=0', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('tabindex')).toBe('0');
    });

    it('should maintain focus on SVG when tabbed to', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'A', y: 10 }],
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      expect(document.activeElement).toBe(svg);
    });
  });

  describe('Arrow Key Navigation', () => {
    it('should navigate to next data point with ArrowRight', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      // Press ArrowRight
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const focused = container.querySelector('.data-point-focused');
      expect(focused).toBeTruthy();
      expect(focused?.classList.contains('data-point')).toBe(true);
    });

    it('should navigate to previous data point with ArrowLeft', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      // Go to first element
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      // Go to second
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      // Go back to first
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

      const focused = container.querySelector('.data-point-focused');
      expect(focused).toBeTruthy();
    });

    it('should wrap around to first element when at end with ArrowRight', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      const dataPoints = Array.from(container.querySelectorAll('.data-point'));

      // Navigate to first
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(dataPoints[0].classList.contains('data-point-focused')).toBe(true);

      // Navigate to second
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(dataPoints[1].classList.contains('data-point-focused')).toBe(true);

      // Wrap to first
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(dataPoints[0].classList.contains('data-point-focused')).toBe(true);
    });

    it('should wrap around to last element when at start with ArrowLeft', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      const dataPoints = Array.from(container.querySelectorAll('.data-point'));

      // Wrap to last immediately
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(dataPoints[1].classList.contains('data-point-focused')).toBe(true);
    });

    it('should support ArrowDown for next (same as ArrowRight)', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

      const focused = container.querySelector('.data-point-focused');
      expect(focused).toBeTruthy();
    });

    it('should support ArrowUp for previous (same as ArrowLeft)', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      // Go forward first
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      // Go back with ArrowUp
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

      // Should wrap to last
      const dataPoints = Array.from(container.querySelectorAll('.data-point'));
      expect(dataPoints[1].classList.contains('data-point-focused')).toBe(true);
    });
  });

  describe('Home/End Key Navigation', () => {
    it('should jump to first data point with Home key', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      const dataPoints = Array.from(container.querySelectorAll('.data-point'));

      // Navigate to middle
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      // Jump to first with Home
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));

      expect(dataPoints[0].classList.contains('data-point-focused')).toBe(true);
    });

    it('should jump to last data point with End key', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      const dataPoints = Array.from(container.querySelectorAll('.data-point'));

      // Jump to last with End
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));

      expect(dataPoints[2].classList.contains('data-point-focused')).toBe(true);
    });
  });

  describe('Escape Key', () => {
    it('should clear focus and blur SVG with Escape key', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      // Navigate to a point
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(container.querySelector('.data-point-focused')).toBeTruthy();

      // Press Escape
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      // Focus should be cleared
      expect(container.querySelector('.data-point-focused')).toBeNull();
    });
  });

  describe('Visual Focus Indicators', () => {
    it('should add data-point-focused class to focused element', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const focused = container.querySelector('.data-point-focused');
      expect(focused).toBeTruthy();
      expect(focused?.getAttribute('data-focused')).toBe('true');
    });

    it('should remove focus class from previous element when navigating', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      const dataPoints = Array.from(container.querySelectorAll('.data-point'));

      // Focus first
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(dataPoints[0].classList.contains('data-point-focused')).toBe(true);

      // Focus second
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(dataPoints[0].classList.contains('data-point-focused')).toBe(false);
      expect(dataPoints[1].classList.contains('data-point-focused')).toBe(true);
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should create live region for announcements', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      // Navigate to trigger announcement
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const liveRegion = document.getElementById('chartlite-live-region');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('role')).toBe('status');
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should announce data point aria-label when focused', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'January', y: 100 },
          { x: 'February', y: 200 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      // Navigate to first point
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const liveRegion = document.getElementById('chartlite-live-region');
      expect(liveRegion?.textContent).toContain('January');
      expect(liveRegion?.textContent).toContain('100');
    });

    it('should update announcement when navigating to different points', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      // Navigate to first
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      const liveRegion1 = document.getElementById('chartlite-live-region');
      const firstAnnouncement = liveRegion1?.textContent;

      // Navigate to second
      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      const liveRegion2 = document.getElementById('chartlite-live-region');
      const secondAnnouncement = liveRegion2?.textContent;

      expect(firstAnnouncement).toBeTruthy();
      expect(secondAnnouncement).toBeTruthy();
      expect(firstAnnouncement).not.toBe(secondAnnouncement);
    });
  });

  describe('BarChart Keyboard Navigation', () => {
    it('should navigate between bars with arrow keys', () => {
      const chart = new BarChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const focused = container.querySelector('.data-point-focused');
      expect(focused).toBeTruthy();
      expect(focused?.tagName.toLowerCase()).toBe('rect');
    });

    it('should work with horizontal bars', () => {
      const chart = new BarChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
        orientation: 'horizontal',
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const focused = container.querySelector('.data-point-focused');
      expect(focused).toBeTruthy();
    });
  });

  describe('ScatterChart Keyboard Navigation', () => {
    it('should navigate between scatter points', () => {
      const chart = new ScatterChart(container, {
        data: [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
          { x: 50, y: 60 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const focused = container.querySelector('.data-point-focused');
      expect(focused).toBeTruthy();
    });

    it('should work with different point shapes', () => {
      const chart = new ScatterChart(container, {
        data: [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
        pointShape: 'square',
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const focused = container.querySelector('.data-point-focused');
      expect(focused).toBeTruthy();
      expect(focused?.tagName.toLowerCase()).toBe('rect');
    });
  });

  describe('Multi-Series Charts', () => {
    it('should navigate across all series in order', () => {
      const chart = new LineChart(container, {
        data: {
          series: [
            { name: 'Series A', dataKey: 'a' },
            { name: 'Series B', dataKey: 'b' },
          ],
          data: [
            { x: 'Jan', a: 10, b: 20 },
            { x: 'Feb', a: 15, b: 25 },
          ],
        },
        showPoints: true,
      });
      chart.render();

      const svg = container.querySelector('svg') as SVGElement;
      svg.focus();

      const dataPoints = container.querySelectorAll('.data-point');
      expect(dataPoints.length).toBe(4); // 2 series × 2 points

      // Navigate through all points and wrap back to first
      // Start at -1, need 5 presses to go: 0, 1, 2, 3, wrap to 0
      for (let i = 0; i < 5; i++) {
        svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      }

      // Should wrap back to first
      expect(dataPoints[0].classList.contains('data-point-focused')).toBe(true);
    });
  });

  describe('Focus Styles', () => {
    it('should have CSS for focus indicators', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'A', y: 10 }],
      });
      chart.render();

      const style = document.getElementById('chartlite-a11y-styles');
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain('.data-point-focused');
      expect(style?.textContent).toContain('stroke:');
      expect(style?.textContent).toContain('filter:');
    });
  });
});
