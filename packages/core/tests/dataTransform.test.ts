import { describe, it, expect } from 'vitest';
import { normalizeData, extractColorsFromSeriesData } from '../src/utils/dataTransform';
import type { DataPoint, ColumnOrientedData, SeriesFirstData } from '../src/types';

describe('Data Transformation', () => {
  describe('normalizeData', () => {
    it('should pass through DataPoint[] unchanged', () => {
      const data: DataPoint[] = [
        { x: 'Jan', y: 30 },
        { x: 'Feb', y: 45 },
      ];
      const result = normalizeData(data);
      expect(result).toEqual(data);
    });

    it('should convert simple number array to DataPoint[]', () => {
      const data = [30, 45, 38];
      const result = normalizeData(data);
      expect(result).toEqual([
        { x: 0, y: 30 },
        { x: 1, y: 45 },
        { x: 2, y: 38 },
      ]);
    });

    describe('Column-oriented format', () => {
      it('should convert column format with simple array', () => {
        const data: ColumnOrientedData = {
          x: ['Jan', 'Feb', 'Mar'],
          y: [30, 45, 38],
        };
        const result = normalizeData(data);
        expect(result).toEqual([
          { x: 'Jan', y: 30 },
          { x: 'Feb', y: 45 },
          { x: 'Mar', y: 38 },
        ]);
      });

      it('should handle column format with multiple series (uses first)', () => {
        const data: ColumnOrientedData = {
          x: ['Jan', 'Feb', 'Mar'],
          y: {
            revenue: [100, 150, 120],
            profit: [50, 75, 60],
          },
        };
        const result = normalizeData(data);
        expect(result).toEqual([
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 150 },
          { x: 'Mar', y: 120 },
        ]);
      });

      it('should handle numeric x values', () => {
        const data: ColumnOrientedData = {
          x: [1, 2, 3],
          y: [10, 20, 30],
        };
        const result = normalizeData(data);
        expect(result).toEqual([
          { x: 1, y: 10 },
          { x: 2, y: 20 },
          { x: 3, y: 30 },
        ]);
      });
    });

    describe('Series-first format', () => {
      it('should convert series-first format', () => {
        const data: SeriesFirstData = {
          series: [
            { name: 'Revenue', dataKey: 'revenue' },
          ],
          data: [
            { month: 'Jan', revenue: 100 },
            { month: 'Feb', revenue: 150 },
            { month: 'Mar', revenue: 120 },
          ],
        };
        const result = normalizeData(data);
        expect(result).toEqual([
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 150 },
          { x: 'Mar', y: 120 },
        ]);
      });

      it('should use custom xKey when provided', () => {
        const data: SeriesFirstData = {
          series: [
            { name: 'Sales', dataKey: 'sales' },
          ],
          data: [
            { quarter: 'Q1', sales: 100 },
            { quarter: 'Q2', sales: 150 },
          ],
          xKey: 'quarter',
        };
        const result = normalizeData(data);
        expect(result).toEqual([
          { x: 'Q1', y: 100 },
          { x: 'Q2', y: 150 },
        ]);
      });

      it('should use first series when multiple series provided', () => {
        const data: SeriesFirstData = {
          series: [
            { name: 'Revenue', dataKey: 'revenue' },
            { name: 'Profit', dataKey: 'profit' },
          ],
          data: [
            { month: 'Jan', revenue: 100, profit: 50 },
            { month: 'Feb', revenue: 150, profit: 75 },
          ],
        };
        const result = normalizeData(data);
        expect(result).toEqual([
          { x: 'Jan', y: 100 },
          { x: 'Feb', y: 150 },
        ]);
      });

      it('should throw error for empty series', () => {
        const data: SeriesFirstData = {
          series: [],
          data: [],
        };
        expect(() => normalizeData(data)).toThrow('Chart data cannot be empty');
      });

      it('should auto-detect x-axis key from non-series keys', () => {
        const data: SeriesFirstData = {
          series: [
            { name: 'Value', dataKey: 'value' },
          ],
          data: [
            { timestamp: '2024-01', value: 100, someOtherField: 'ignore' },
            { timestamp: '2024-02', value: 150, someOtherField: 'ignore' },
          ],
        };
        const result = normalizeData(data);
        // Should use 'timestamp' as it's the first non-series key
        expect(result[0].x).toBe('2024-01');
        expect(result[0].y).toBe(100);
      });
    });
  });

  describe('extractColorsFromSeriesData', () => {
    it('should extract colors from series-first format', () => {
      const data: SeriesFirstData = {
        series: [
          { name: 'Revenue', dataKey: 'revenue', color: '#3b82f6' },
          { name: 'Profit', dataKey: 'profit', color: '#10b981' },
        ],
        data: [{ x: 'Jan', revenue: 100, profit: 50 }],
      };
      const colors = extractColorsFromSeriesData(data);
      expect(colors).toEqual(['#3b82f6', '#10b981']);
    });

    it('should return undefined for non-series-first format', () => {
      const data: DataPoint[] = [
        { x: 'Jan', y: 30 },
      ];
      const colors = extractColorsFromSeriesData(data);
      expect(colors).toBeUndefined();
    });

    it('should filter out series without colors', () => {
      const data: SeriesFirstData = {
        series: [
          { name: 'Revenue', dataKey: 'revenue', color: '#3b82f6' },
          { name: 'Profit', dataKey: 'profit' }, // No color
          { name: 'Costs', dataKey: 'costs', color: '#ef4444' },
        ],
        data: [{ x: 'Jan', revenue: 100, profit: 50, costs: 30 }],
      };
      const colors = extractColorsFromSeriesData(data);
      expect(colors).toEqual(['#3b82f6', '#ef4444']);
    });

    it('should return undefined if no series have colors', () => {
      const data: SeriesFirstData = {
        series: [
          { name: 'Revenue', dataKey: 'revenue' },
          { name: 'Profit', dataKey: 'profit' },
        ],
        data: [{ x: 'Jan', revenue: 100, profit: 50 }],
      };
      const colors = extractColorsFromSeriesData(data);
      expect(colors).toBeUndefined();
    });
  });
});
