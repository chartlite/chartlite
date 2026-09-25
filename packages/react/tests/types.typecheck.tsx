/**
 * Compile-time checks, run by `pnpm lint` (`tsc -p tsconfig.test.json`).
 * Every `@ts-expect-error` below must be a real type error, or tsc fails.
 */
import { createRef } from 'react';
import { Chart, LineChart, Sparkline, type ChartHandle, type ChartProps } from '../src';

const data = [{ x: 'Jan', y: 1 }];
const ref = createRef<ChartHandle>();

// Valid usage.
export const valid = [
  <Chart type="line" data={data} curve="smooth" showPoints={false} />,
  <Chart type="bar" data={data} orientation="horizontal" stacked />,
  <Chart type="radial" data={data} max={100} startAngle={-90} />,
  <Chart type="sparkline" data={[1, 2, 3]} showEndDot={false} />,
  <Chart type="pie" data={data} innerRadius={0.6} tooltip ref={ref} />,
  <LineChart data={data} tooltip={{ backgroundColor: '#000' }} ref={ref} />,
  <LineChart data={data} id="c" aria-label="Revenue" data-testid="c" />,
  <Sparkline data={[1, 2]} type="area" />,
];

// A spec object can be spread straight in.
const spec: ChartProps = { type: 'combo', data, defaultType: 'line' };
export const spread = <Chart {...spec} />;

export const invalid = [
  // @ts-expect-error — typo'd option name is rejected for the `line` member.
  <Chart type="line" data={data} curv="smooth" />,
  // @ts-expect-error — `orientation` belongs to bar charts, not line charts.
  <Chart type="line" data={data} orientation="horizontal" />,
  // @ts-expect-error — unknown chart type.
  <Chart type="donut" data={data} />,
  // @ts-expect-error — wrong value type for a known option.
  <Chart type="radial" data={data} max="100" />,
  // @ts-expect-error — `data` is required.
  <Chart type="bar" />,
  // @ts-expect-error — typo'd option on a named component.
  <LineChart data={data} curv="smooth" />,
];
