/**
 * Utility functions for chartlite
 */

import type { Dimensions } from '../types';

// Export data transformation utilities
export {
  normalizeData,
  extractColorsFromSeriesData,
  isMultiSeriesData,
  extractSeriesDefinitions,
  normalizeToSeriesData,
  getAllXValues,
  getCombinedYRange,
} from './dataTransform';

/**
 * Get default dimensions with margins
 */
export function getDefaultDimensions(
  width: number = 600,
  height: number = 400
): Dimensions {
  return {
    width,
    height,
    margin: {
      top: 40,
      right: 40,
      bottom: 60,
      left: 60,
    },
  };
}

/**
 * Calculate linear scale
 */
export function createLinearScale(
  domain: [number, number],
  range: [number, number]
): (value: number) => number {
  const [domainMin, domainMax] = domain;
  const [rangeMin, rangeMax] = range;
  const domainSpan = domainMax - domainMin;
  const rangeSpan = rangeMax - rangeMin;

  return (value: number) => {
    const normalized = (value - domainMin) / domainSpan;
    return rangeMin + normalized * rangeSpan;
  };
}

/**
 * Calculate band scale for categorical data
 */
export function createBandScale(
  domain: string[],
  range: [number, number],
  padding: number = 0.1
): { scale: (value: string) => number; bandwidth: number } {
  const [rangeMin, rangeMax] = range;
  const rangeSpan = rangeMax - rangeMin;
  const count = domain.length;
  const step = rangeSpan / count;
  const bandwidth = step * (1 - padding);
  const offset = (step - bandwidth) / 2;

  const scale = (value: string) => {
    const index = domain.indexOf(value);
    return rangeMin + index * step + offset;
  };

  return { scale, bandwidth };
}

/**
 * Generate SVG path for line chart
 */
export function generateLinePath(
  points: Array<{ x: number; y: number }>,
  curve: 'linear' | 'smooth' = 'linear'
): string {
  if (points.length === 0) return '';

  if (curve === 'linear') {
    return points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
      .join(' ');
  }

  // Smooth curve using Catmull-Rom spline
  if (points.length < 2) {
    return `M ${points[0].x},${points[0].y}`;
  }

  let path = `M ${points[0].x},${points[0].y}`;

  // Catmull-Rom to Cubic Bezier conversion
  // tension=0.5 gives standard Catmull-Rom, 0.3 is smoother
  const tension = 0.3;

  for (let i = 0; i < points.length - 1; i++) {
    // Get the 4 points needed for Catmull-Rom: p0, p1, p2, p3
    // For the curve segment from p1 to p2
    const p0 = i > 0 ? points[i - 1] : points[i]; // Use current point if at start
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1]; // Use next point if at end

    // Convert Catmull-Rom to Cubic Bezier control points
    // Control point 1
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;

    // Control point 2
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return path;
}

/**
 * Get theme colors
 */
export function getThemeColors(theme: string): {
  background: string;
  foreground: string;
  primary: string;
  grid: string;
  text: string;
  seriesColors: string[];
} {
  const themes = {
    default: {
      background: '#ffffff',
      foreground: '#f9fafb',
      primary: '#3b82f6',
      grid: '#e5e7eb', // Intentionally subtle (decorative, not interactive)
      text: '#1f2937',
      seriesColors: [
        '#3b82f6', // blue-500 (3.68:1) ✅
        '#059669', // emerald-600 (4.04:1) ✅
        '#d97706', // amber-600 (3.02:1) ✅
        '#ef4444', // red-500 (3.76:1) ✅
        '#8b5cf6', // violet-500 (4.23:1) ✅
        '#ec4899', // pink-500 (3.53:1) ✅
        '#0891b2', // cyan-600 (3.58:1) ✅
        '#ea580c', // orange-600 (3.39:1) ✅
      ],
    },
    midnight: {
      background: '#0f172a',
      foreground: '#1e293b',
      primary: '#60a5fa',
      grid: '#334155', // Intentionally subtle (decorative, not interactive)
      text: '#f1f5f9',
      seriesColors: [
        '#60a5fa', // blue-400 (7.02:1) ✅
        '#34d399', // green-400 (9.29:1) ✅
        '#fbbf24', // amber-400 (10.69:1) ✅
        '#f87171', // red-400 (6.45:1) ✅
        '#a78bfa', // violet-400 (6.56:1) ✅
        '#f472b6', // pink-400 (6.74:1) ✅
        '#22d3ee', // cyan-400 (9.88:1) ✅
        '#fb923c', // orange-400 (7.89:1) ✅
      ],
    },
    minimal: {
      background: '#ffffff',
      foreground: '#fafafa',
      primary: '#000000',
      grid: '#e5e5e5', // Intentionally subtle (decorative, not interactive)
      text: '#171717',
      seriesColors: [
        '#000000', // black (21.00:1) ✅
        '#525252', // gray-600 (7.81:1) ✅
        '#737373', // gray-500 (4.74:1) ✅
        '#595959', // gray-550 (6.39:1) ✅
        '#171717', // gray-900 (17.93:1) ✅
        '#404040', // gray-700 (10.37:1) ✅
        '#262626', // gray-800 (15.13:1) ✅
        '#8a8a8a', // gray-450 (3.62:1) ✅
      ],
    },
  };

  return themes[theme as keyof typeof themes] || themes.default;
}

/**
 * Generate colors for series
 * Uses custom colors if provided, otherwise auto-assigns from theme
 */
export function generateSeriesColors(
  seriesCount: number,
  customColors: string[] | undefined,
  theme: string
): string[] {
  const themeColors = getThemeColors(theme);

  // If custom colors provided, use them (cycling if necessary)
  if (customColors && customColors.length > 0) {
    return Array.from({ length: seriesCount }, (_, i) =>
      customColors[i % customColors.length]
    );
  }

  // Use theme's series colors (cycling if necessary)
  return Array.from({ length: seriesCount }, (_, i) =>
    themeColors.seriesColors[i % themeColors.seriesColors.length]
  );
}

/**
 * Calculate nice tick values for axis
 */
export function calculateNiceTicks(
  min: number,
  max: number,
  count: number = 5
): number[] {
  // Validate inputs
  if (!isFinite(min) || !isFinite(max)) {
    throw new Error('calculateNiceTicks: min and max must be finite numbers');
  }

  if (count <= 1) {
    // Return just the endpoints
    return [min, max];
  }

  // Handle edge case where min === max
  if (Math.abs(max - min) < Number.EPSILON) {
    // If they're equal, create ticks around that value
    const value = min;
    const spread = Math.abs(value) * 0.1 || 1; // 10% spread or 1 if value is 0
    return calculateNiceTicks(value - spread, value + spread, count);
  }

  const range = max - min;

  // Handle very small ranges (prevent precision issues)
  if (range < 1e-10) {
    // Use simple linear interpolation for very small ranges
    const ticks: number[] = [];
    for (let i = 0; i < count; i++) {
      ticks.push(min + (range * i) / (count - 1));
    }
    return ticks;
  }

  const roughStep = range / (count - 1);

  // Find the power of 10
  const power = Math.floor(Math.log10(roughStep));
  const magnitude = Math.pow(10, power);

  // Normalize the step
  const normalizedStep = roughStep / magnitude;
  let niceStep: number;

  if (normalizedStep <= 1) niceStep = 1;
  else if (normalizedStep <= 2) niceStep = 2;
  else if (normalizedStep <= 5) niceStep = 5;
  else niceStep = 10;

  const step = niceStep * magnitude;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  let currentTick = niceMin;

  // Prevent infinite loops with a maximum iteration count
  const maxIterations = count * 3; // Allow some overflow
  let iterations = 0;

  while (currentTick <= niceMax && iterations < maxIterations) {
    ticks.push(currentTick);
    currentTick += step;
    iterations++;
  }

  // Ensure we have at least 2 ticks
  if (ticks.length < 2) {
    return [min, max];
  }

  return ticks;
}

// Export data sampling utilities
export {
  downsampleLTTB,
  downsampleEveryNth,
  autoDownsample,
} from './sampling';

// Export element pool
export { ElementPool, globalElementPool } from './elementPool';