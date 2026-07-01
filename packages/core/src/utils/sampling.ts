/**
 * Data Sampling Utilities
 *
 * Implements Largest Triangle Three Buckets (LTTB) downsampling algorithm.
 * Reduces the number of data points while preserving visual shape and important features.
 *
 * Reference: https://github.com/sveinn-steinarsson/flot-downsample
 *
 * Performance Impact:
 * - 2000 points → 1000 points = 2x faster rendering
 * - Maintains visual fidelity
 * - Preserves peaks, valleys, and trends
 */

import type { DataPoint } from '../types';

/**
 * Largest Triangle Three Buckets (LTTB) downsampling algorithm
 *
 * This algorithm intelligently selects data points to preserve the visual shape
 * of the data while reducing the total number of points.
 *
 * @param data - Input data points
 * @param threshold - Target number of points (must be >= 3)
 * @returns Downsampled data points
 */
export function downsampleLTTB(data: DataPoint[], threshold: number): DataPoint[] {
  // No need to downsample if data is already small enough
  if (data.length <= threshold) {
    return data;
  }

  // Must have at least 3 points for the algorithm to work
  if (threshold < 3) {
    throw new Error('Threshold must be >= 3');
  }

  // Convert x values to numbers for calculation
  const dataWithNumericX = data.map((point, index) => ({
    ...point,
    xNum: typeof point.x === 'number' ? point.x : index,
  }));

  const sampled: DataPoint[] = [];
  const dataLength = data.length;

  // Always include first point
  sampled.push(data[0]);

  // Bucket size (leave room for first and last point)
  const bucketSize = (dataLength - 2) / (threshold - 2);

  // Index of point selected in previous bucket
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate average point for next bucket (the bucket after this one)
    let avgX = 0;
    let avgY = 0;

    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(
      Math.floor((i + 2) * bucketSize) + 1,
      dataLength
    );
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += dataWithNumericX[j].xNum;
      avgY += dataWithNumericX[j].y;
    }

    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Get the range for this bucket
    const rangeOffs = Math.floor(i * bucketSize) + 1;
    const rangeTo = Math.min(
      Math.floor((i + 1) * bucketSize) + 1,
      dataLength
    );

    // Point a (the point selected in the previous bucket)
    const pointAX = dataWithNumericX[a].xNum;
    const pointAY = dataWithNumericX[a].y;

    // Find the point in this bucket with the largest triangle area
    let maxArea = -1;
    let maxAreaPoint = rangeOffs;

    for (let j = rangeOffs; j < rangeTo; j++) {
      // Calculate triangle area over three buckets
      const area = Math.abs(
        (pointAX - avgX) * (dataWithNumericX[j].y - pointAY) -
        (pointAX - dataWithNumericX[j].xNum) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = j;
      }
    }

    sampled.push(data[maxAreaPoint]);
    a = maxAreaPoint; // This point is the next "a"
  }

  // Always include last point
  sampled.push(data[dataLength - 1]);

  return sampled;
}

/**
 * Simple downsampling that takes every nth point
 * Faster but less accurate than LTTB
 */
export function downsampleEveryNth(data: DataPoint[], threshold: number): DataPoint[] {
  if (data.length <= threshold) {
    return data;
  }

  const sampled: DataPoint[] = [];
  const step = data.length / threshold;

  for (let i = 0; i < threshold; i++) {
    const index = Math.floor(i * step);
    sampled.push(data[index]);
  }

  // Ensure last point is included
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled[sampled.length - 1] = data[data.length - 1];
  }

  return sampled;
}

/**
 * Auto-downsample data based on threshold
 *
 * @param data - Input data points
 * @param maxPoints - Maximum number of points to render (default: 1000)
 * @param algorithm - Downsampling algorithm to use
 * @returns Original or downsampled data
 */
export function autoDownsample(
  data: DataPoint[],
  maxPoints: number = 1000,
  algorithm: 'lttb' | 'nth' = 'lttb'
): DataPoint[] {
  if (data.length <= maxPoints) {
    return data;
  }

  if (algorithm === 'lttb') {
    return downsampleLTTB(data, maxPoints);
  } else {
    return downsampleEveryNth(data, maxPoints);
  }
}
