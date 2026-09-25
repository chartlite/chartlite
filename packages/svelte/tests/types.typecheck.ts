/**
 * Compile-time checks, run by `pnpm lint` (`tsc -p tsconfig.test.json`).
 * Every `@ts-expect-error` below must be a real type error, or tsc fails.
 */
import { chart, type ChartParams } from '../src';

declare const node: HTMLElement;
const data = [{ x: 'Jan', y: 1 }];

// Valid params.
export const valid: ChartParams[] = [
  { type: 'line', data, curve: 'smooth', showPoints: false, tooltip: true },
  { type: 'bar', data, orientation: 'horizontal', stacked: true },
  { type: 'radial', data, max: 100, startAngle: -90, endAngle: 90 },
  { type: 'sparkline', data: [1, 2, 3], showEndDot: false, strokeWidth: 2 },
  { type: 'pie', data, innerRadius: 0.6, tooltip: { backgroundColor: '#000' } },
  { type: 'scatter', data, pointShape: 'triangle', onPointClick: (e) => e.x },
];

export const invalid = [
  // @ts-expect-error — typo'd option name is rejected for the `line` member.
  chart(node, { type: 'line', data, curv: 'smooth' }),
  // @ts-expect-error — `orientation` belongs to bar charts, not line charts.
  chart(node, { type: 'line', data, orientation: 'horizontal' }),
  // @ts-expect-error — unknown chart type.
  chart(node, { type: 'donut', data }),
  // @ts-expect-error — wrong value type for a known option.
  chart(node, { type: 'radial', data, max: '100' }),
  // @ts-expect-error — `data` is required.
  chart(node, { type: 'bar' }),
];
