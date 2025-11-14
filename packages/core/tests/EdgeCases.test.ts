import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import { calculateNiceTicks } from '../src/utils';
import type { DataPoint } from '../src/types';

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

    it('should throw error for data with Infinity values', () => {
      expect(() => {
        new LineChart(container, {
          data: [
            { x: 'Jan', y: 30 },
            { x: 'Feb', y: Infinity },
          ],
        });
      }).toThrow('Invalid data format');
    });

    it('should handle single data point', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'Jan', y: 42 }],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle negative values', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'Jan', y: -10 },
          { x: 'Feb', y: -20 },
          { x: 'Mar', y: 5 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle very large numbers', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'Jan', y: 1e10 },
          { x: 'Feb', y: 2e10 },
          { x: 'Mar', y: 1.5e10 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle very small numbers', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'Jan', y: 0.0001 },
          { x: 'Feb', y: 0.0002 },
          { x: 'Mar', y: 0.00015 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle numbers very close to zero', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'Jan', y: 1e-10 },
          { x: 'Feb', y: 2e-10 },
          { x: 'Mar', y: 1.5e-10 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle all zero values', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'Jan', y: 0 },
          { x: 'Feb', y: 0 },
          { x: 'Mar', y: 0 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
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
    it('should throw error for invalid container selector', () => {
      expect(() => {
        new LineChart('#nonexistent-container', {
          data: [{ x: 'Jan', y: 30 }],
        });
      }).toThrow('Container not found');
    });

    it('should throw error for zero width', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          width: 0,
        });
      }).toThrow('Invalid width');
    });

    it('should throw error for negative width', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          width: -100,
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

    it('should throw error for negative height', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          height: -100,
        });
      }).toThrow('Invalid height');
    });

    it('should throw error for invalid theme', () => {
      expect(() => {
        new LineChart(container, {
          data: [{ x: 'Jan', y: 30 }],
          theme: 'nonexistent' as any,
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
        new LineChart(null as any, {
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

    it('should handle count = 1', () => {
      const ticks = calculateNiceTicks(0, 100, 1);
      expect(ticks).toEqual([0, 100]);
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

    it('should throw for Infinity max', () => {
      expect(() => {
        calculateNiceTicks(0, Infinity, 5);
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

    it('should allow calling render() multiple times', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'Jan', y: 30 }],
      });
      chart.render();
      expect(() => chart.render()).not.toThrow();
      expect(() => chart.render()).not.toThrow();
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

    it('should handle update() with valid new data', () => {
      const chart = new LineChart(container, {
        data: [{ x: 'Jan', y: 30 }],
      });
      chart.render();

      expect(() => {
        chart.update([
          { x: 'Feb', y: 45 },
          { x: 'Mar', y: 38 },
        ]);
      }).not.toThrow();
    });
  });

  describe('Multi-series edge cases', () => {
    it('should handle single series in multi-series format', () => {
      const chart = new LineChart(container, {
        data: {
          series: [{ name: 'Series 1', dataKey: 'value' }],
          data: [
            { month: 'Jan', value: 30 },
            { month: 'Feb', value: 45 },
          ],
        },
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

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

  describe('Rendering with minimal config', () => {
    it('should render BarChart with only required data', () => {
      const chart = new BarChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      const bars = svg?.querySelectorAll('.bar');
      expect(bars?.length).toBe(2);
    });

    it('should render LineChart with only required data', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('Extreme value edge cases', () => {
    it('should handle data with extreme positive values', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: Number.MAX_SAFE_INTEGER / 2 },
          { x: 'B', y: Number.MAX_SAFE_INTEGER / 3 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle data with extreme negative values', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: Number.MIN_SAFE_INTEGER / 2 },
          { x: 'B', y: Number.MIN_SAFE_INTEGER / 3 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle mix of very small and very large values', () => {
      const chart = new LineChart(container, {
        data: [
          { x: 'A', y: 0.000001 },
          { x: 'B', y: 1000000 },
          { x: 'C', y: 0.5 },
        ],
      });
      chart.render();

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('Container edge cases', () => {
    it('should handle container with zero clientWidth/clientHeight', () => {
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
      expect(svg).toBeTruthy();

      document.body.removeChild(hiddenContainer);
    });
  });
});
