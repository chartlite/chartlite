/**
 * Utility functions for chartlite
 */

import type { Dimensions } from '../types';

// Export data transformation utilities
export { normalizeData, extractColorsFromSeriesData } from './dataTransform';

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

  // Smooth curve using cubic bezier (simplified Catmull-Rom)
  if (points.length < 2) {
    return `M ${points[0].x},${points[0].y}`;
  }

  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const tension = 0.3;

    const cp1x = current.x + (next.x - current.x) * tension;
    const cp1y = current.y;
    const cp2x = next.x - (next.x - current.x) * tension;
    const cp2y = next.y;

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
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
} {
  const themes = {
    default: {
      background: '#ffffff',
      foreground: '#f9fafb',
      primary: '#3b82f6',
      grid: '#e5e7eb',
      text: '#1f2937',
    },
    midnight: {
      background: '#0f172a',
      foreground: '#1e293b',
      primary: '#60a5fa',
      grid: '#334155',
      text: '#f1f5f9',
    },
    minimal: {
      background: '#ffffff',
      foreground: '#fafafa',
      primary: '#000000',
      grid: '#e5e5e5',
      text: '#171717',
    },
  };

  return themes[theme as keyof typeof themes] || themes.default;
}

/**
 * Calculate nice tick values for axis
 */
export function calculateNiceTicks(
  min: number,
  max: number,
  count: number = 5
): number[] {
  const range = max - min;
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
  for (let i = niceMin; i <= niceMax; i += step) {
    ticks.push(i);
  }
  
  return ticks;
}