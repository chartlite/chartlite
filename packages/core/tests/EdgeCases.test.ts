import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { calculateNiceTicks } from '../src/utils';

describe('Edge Cases and Error Handling', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-chart';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Data validation edge cases', () => {
    it('should throw error for empty data array', () => {
      expect(() => {
        new LineChart(container, { data: [] });
      }).toThrow('Chart data cannot be empty');
    });

    it('should throw error for data with NaN values', () => {
      expect(() => {
        new LineChart(container, {
          data: [
            { x: 'Jan', y: 30 },
            { x: 'Feb', y: NaN },
          ],
        });
      }).toThrow('Invalid data format');
    });

    it('should throw for mismatched array lengths in column-oriented data', () => {
      expect(() => {
        new LineChart(container, {
          data: {
            x: ['Jan', 'Feb', 'Mar'],
            y: [30, 45], // Wrong length!
          },
        });
      }).toThrow('Invalid data format');
    });

    it('should throw for invalid simple number array (contains NaN)', () => {
      expect(() => {
        new LineChart(container, {
          data: [30, 45, NaN, 52],
        });
      }).toThrow('Invalid data format');
    });
  });

  describe('Configuration edge cases', () => {
    it('should throw error for zero width', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          width: 0,
        });
      }).toThrow('Invalid width');
    });

    it('should throw error for zero height', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          height: 0,
        });
      }).toThrow('Invalid height');
    });

    it('should throw error for invalid theme', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          // @ts-expect-error: this test intentionally exercises runtime theme validation.
          theme: 'nonexistent',
        });
      }).toThrow('Invalid theme');
    });

    it('should throw error for empty colors array', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          colors: [],
        });
      }).toThrow('Colors array cannot be empty');
    });

    it('should throw error for invalid color format', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          colors: ['not-a-color!@#$'],
        });
      }).toThrow('Invalid color');
    });

    it('should throw error for null container', () => {
      expect(() => {
        // @ts-expect-error: null is intentional input for the runtime container guard.
        new LineChart(null, {
          data: [{ x: 'Jan', y: 30 }],
        });
      }).toThrow('Container must be a valid HTMLElement');
    });
  });

  describe('calculateNiceTicks edge cases', () => {
    it('should handle min === max', () => {
      const ticks = calculateNiceTicks(50, 50, 5);
      expect(ticks.length).toBeGreaterThan(0);
      // Should create ticks around the value
      expect(ticks.some(t => t < 50)).toBe(true);
      expect(ticks.some(t => t > 50)).toBe(true);
    });

    it('should handle count = 0', () => {
      const ticks = calculateNiceTicks(0, 100, 0);
      expect(ticks).toEqual([0, 100]);
    });

    it('should handle very small range', () => {
      const ticks = calculateNiceTicks(0.00001, 0.00002, 5);
      expect(ticks.length).toBeGreaterThan(1);
      expect(ticks[0]).toBeLessThanOrEqual(0.00001);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(0.00002);
    });

    it('should throw for NaN min', () => {
      expect(() => {
        calculateNiceTicks(NaN, 100, 5);
      }).toThrow('must be finite numbers');
    });

    it('should handle negative range', () => {
      const ticks = calculateNiceTicks(-100, -50, 5);
      expect(ticks.length).toBeGreaterThan(1);
      expect(ticks[0]).toBeLessThanOrEqual(-100);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(-50);
    });

    it('should handle range crossing zero', () => {
      const ticks = calculateNiceTicks(-50, 50, 5);
      expect(ticks.length).toBeGreaterThan(1);
      expect(ticks.some(t => t === 0)).toBe(true);
    });
  });

  describe('Chart lifecycle edge cases', () => {
    it('should allow calling destroy() multiple times', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'Jan', y: 30 }],
      });
      chart.render();
      chart.destroy();
      expect(() => chart.destroy()).not.toThrow();
    });

    it('should throw when calling toSVG() before render()', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'Jan', y: 30 }],
      });
      expect(() => chart.toSVG()).toThrow('must be rendered before calling toSVG');
    });

    it('should successfully export SVG after render()', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'Jan', y: 30 }],
      });
      chart.render();
      const svg = chart.toSVG();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should handle update() with empty data by throwing', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'Jan', y: 30 }],
      });
      chart.render();

      expect(() => {
        chart.update([]);
      }).toThrow('Chart data cannot be empty');
    });

  });

  describe('Multi-series edge cases', () => {
    it('should handle empty series array', () => {
      expect(() => {
        new LineChart(container, {
          data: {
            series: [],
            data: [],
          },
        });
      }).toThrow('Chart data cannot be empty');
    });
  });

  describe('Container edge cases', () => {
    it('uses explicit dimensions when the container has no layout size', () => {
      // Create a container with display:none (zero dimensions)
      const hiddenContainer = document.createElement('div');
      hiddenContainer.style.display = 'none';
      document.body.appendChild(hiddenContainer);

      const chart = new LineChart(hiddenContainer, {
        data: [{ x: 'Jan', y: 30 }],
        width: 600, // Must provide explicit dimensions
        height: 400,
      });
      chart.render();

      const svg = hiddenContainer.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('600');
      expect(svg?.getAttribute('height')).toBe('400');

      document.body.removeChild(hiddenContainer);
    });
  });
});
