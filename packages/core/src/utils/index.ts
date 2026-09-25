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
      top: 16,
      right: 16,
      bottom: 28,
      left: 48,
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

  if (domainSpan === 0) {
    const midpoint = rangeMin + rangeSpan / 2;
    return () => midpoint;
  }

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
): BandScale {
  const [rangeMin, rangeMax] = range;
  const rangeSpan = rangeMax - rangeMin;
  const count = domain.length;
  if (count === 0) {
    return { scale: () => rangeMin, bandwidth: 0 };
  }
  const step = rangeSpan / count;
  const bandwidth = step * (1 - padding);
  const offset = (step - bandwidth) / 2;
  const indexes = new Map(domain.map((value, index) => [value, index]));

  const scale = (value: string) => {
    const index = indexes.get(value) ?? -1;
    return rangeMin + index * step + offset;
  };

  return { scale, bandwidth };
}

export interface BandScale {
  scale: (value: string) => number;
  bandwidth: number;
}

const r2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Generate SVG path for line chart. `smooth` uses monotone-x cubic
 * interpolation (like d3's `curveMonotoneX`): it passes through every point and
 * never overshoots the data, so smoothed peaks and dips stay truthful.
 */
export function generateLinePath(
  points: Array<{ x: number; y: number }>,
  curve: 'linear' | 'smooth' = 'linear'
): string {
  const n = points.length;
  if (n === 0) return '';
  let path = `M${r2(points[0].x)},${r2(points[0].y)}`;

  if (curve !== 'smooth' || n < 3) {
    for (let i = 1; i < n; i++) path += `L${r2(points[i].x)},${r2(points[i].y)}`;
    return path;
  }

  // Secant slopes, then Fritsch–Carlson tangents (weighted harmonic mean,
  // zero at local extrema) so each segment stays monotone.
  const secant: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    secant.push(dx ? (points[i + 1].y - points[i].y) / dx : 0);
  }
  const tangent = [secant[0]];
  for (let i = 1; i < n - 1; i++) {
    const s0 = secant[i - 1];
    const s1 = secant[i];
    const h0 = points[i].x - points[i - 1].x;
    const h1 = points[i + 1].x - points[i].x;
    tangent.push(s0 * s1 <= 0 ? 0 : (3 * (h0 + h1)) / ((2 * h1 + h0) / s0 + (h1 + 2 * h0) / s1));
  }
  tangent.push(secant[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const third = (p1.x - p0.x) / 3;
    path += `C${r2(p0.x + third)},${r2(p0.y + tangent[i] * third)} ${r2(p1.x - third)},${r2(
      p1.y - tangent[i + 1] * third
    )} ${r2(p1.x)},${r2(p1.y)}`;
  }
  return path;
}

/** Theme values are allocated once rather than rebuilt on every chart render. */
const THEMES = {
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
        '#64748b', // slate-500 (4.76:1) ✅ (distinct from the amber/red pair)
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
        // Ordered so neighbouring series alternate dark/light for separation.
        '#000000', // black (21.00:1) ✅
        '#8a8a8a', // gray-450 (3.62:1) ✅
        '#404040', // gray-700 (10.37:1) ✅
        '#737373', // gray-500 (4.74:1) ✅
        '#171717', // gray-900 (17.93:1) ✅
        '#595959', // gray-550 (6.39:1) ✅
        '#262626', // gray-800 (15.13:1) ✅
        '#525252', // gray-600 (7.81:1) ✅
      ],
    },
    tailwind: {
      background: '#ffffff',
      foreground: '#f8fafc', // slate-50
      primary: '#4f46e5', // indigo-600
      grid: '#e2e8f0', // slate-200 (decorative)
      text: '#0f172a', // slate-900
      seriesColors: [
        '#4f46e5', // indigo-600
        '#059669', // emerald-600
        '#d97706', // amber-600
        '#e11d48', // rose-600
        '#0284c7', // sky-600
        '#7c3aed', // violet-600
        '#0d9488', // teal-600
        '#ea580c', // orange-600
      ],
    },
    nord: {
      background: '#2e3440', // nord0 (polar night)
      foreground: '#3b4252', // nord1
      primary: '#88c0d0', // nord8 (frost)
      grid: '#434c5e', // nord2 (decorative)
      text: '#eceff4', // nord6 (snow storm)
      seriesColors: [
        '#88c0d0', // frost
        '#a3be8c', // aurora green
        '#ebcb8b', // aurora yellow
        '#bf616a', // aurora red
        '#b48ead', // aurora purple
        '#81a1c1', // frost blue
        '#8fbcbb', // frost teal
        '#d08770', // aurora orange
      ],
    },
    'high-contrast': {
      background: '#ffffff',
      foreground: '#ffffff',
      primary: '#000000',
      grid: '#767676', // minimum 3:1 on white (visible, not decorative)
      text: '#000000',
      seriesColors: [
        '#000000', // black (21:1)
        '#1d4ed8', // blue-700 (~6.3:1)
        '#b91c1c', // red-700 (~5.9:1)
        '#15803d', // green-700 (~4.5:1)
        '#6b21a8', // purple-800 (~8:1)
        '#a16207', // yellow-700 (~4.7:1)
        '#0e7490', // cyan-700 (~4.8:1)
        '#c2410c', // orange-700 (~4.6:1)
      ],
    },
};

export function getThemeColors(theme: string): typeof THEMES.default {
  return isThemeName(theme) ? THEMES[theme] : THEMES.default;
}

function isThemeName(theme: string): theme is keyof typeof THEMES {
  return Object.hasOwn(THEMES, theme);
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
 * Calculate "nice" tick values (multiples of 1, 2 or 5 × 10ⁿ) that cover
 * `[min, max]`, aiming for roughly `count` intervals. The first and last ticks
 * extend to the nearest nice value outside the data, so they can be used
 * directly as the axis domain.
 */
export function calculateNiceTicks(
  min: number,
  max: number,
  count: number = 5
): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) throw new Error('min and max must be finite numbers');
  if (count <= 1) return [min, max];
  if (min === max) {
    const spread = Math.abs(min) * 0.1 || 1;
    return calculateNiceTicks(min - spread, max + spread, count);
  }

  const rough = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const error = rough / magnitude;
  const step = (error >= 7.07 ? 10 : error >= 3.16 ? 5 : error >= 1.41 ? 2 : 1) * magnitude;
  if (!Number.isFinite(step) || step <= 0) return [min, max];

  // Index-based (not accumulated) values avoid floating-point drift such as
  // 0.30000000000000004; the epsilon keeps exact multiples from over-extending.
  const ticks: number[] = [];
  const last = Math.ceil(max / step - 1e-9);
  for (let i = Math.floor(min / step + 1e-9); i <= last; i++) {
    ticks.push(parseFloat((i * step).toPrecision(12)));
  }
  return ticks.length > 1 ? ticks : [min, max];
}

/**
 * Default axis tick formatter for a set of nice ticks: grouped digits below
 * 10,000 ("2,500"), compact notation above ("12K", "1.5M"), with just enough
 * decimals to tell adjacent ticks apart.
 */
export function tickFormatter(ticks: number[]): (value: number) => string {
  const step = Math.abs(ticks[1] - ticks[0]) || 1;
  const largest = Math.max(Math.abs(ticks[0]), Math.abs(ticks[ticks.length - 1]));
  const unit = largest >= 1e4 ? Math.floor(Math.log10(largest) / 3) * 3 : 0;
  const format = new Intl.NumberFormat(undefined, {
    notation: unit ? 'compact' : 'standard',
    maximumFractionDigits: Math.min(20, Math.max(0, Math.ceil(unit - Math.log10(step) - 1e-9))),
  });
  return (value) => format.format(value);
}

// Export data sampling utilities
export {
  downsampleLTTB,
  downsampleEveryNth,
  autoDownsample,
} from './sampling';
