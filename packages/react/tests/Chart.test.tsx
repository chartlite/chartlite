import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Chart, LineChart, BarChart, PieChart, ComboChart, Sparkline } from '../src';

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

afterEach(cleanup);

describe('@chartlite/react', () => {
  it('generic <Chart> renders an SVG for a given type', () => {
    const { container } = render(<Chart type="line" data={data} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('generic <Chart> covers the newer chart types (pie, radial, combo, sparkline)', () => {
    const combo = {
      series: [
        { name: 'Rev', dataKey: 'rev', type: 'bar' as const },
        { name: 'Trend', dataKey: 'trend', type: 'line' as const },
      ],
      data: [
        { x: 'Jan', rev: 10, trend: 4 },
        { x: 'Feb', rev: 20, trend: 8 },
      ],
    };
    for (const el of [
      <Chart key="p" type="pie" data={data} />,
      <Chart key="r" type="radial" data={[{ x: 'Score', y: 70 }]} max={100} />,
      <Chart key="c" type="combo" data={combo} />,
      <Chart key="s" type="sparkline" data={[1, 2, 3, 2, 4]} />,
    ]) {
      const { container, unmount } = render(el);
      expect(container.querySelector('svg')).toBeTruthy();
      unmount();
    }
  });

  it('named components render their chart type', () => {
    const { container } = render(<LineChart data={data} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('passes config through (theme, title) to the core chart', () => {
    const { container } = render(<BarChart data={data} title="Sales" theme="midnight" />);
    const svg = container.querySelector('svg');
    expect(svg?.querySelector('title')?.textContent).toContain('Sales');
  });

  it('renders combo and sparkline via named components', () => {
    const combo = {
      series: [
        { name: 'A', dataKey: 'a', type: 'bar' as const },
        { name: 'B', dataKey: 'b', type: 'line' as const },
      ],
      data: [{ x: 'Q1', a: 5, b: 2 }, { x: 'Q2', a: 8, b: 4 }],
    };
    const combo1 = render(<ComboChart data={combo} />);
    expect(combo1.container.querySelector('rect.bar')).toBeTruthy();
    expect(combo1.container.querySelector('path.combo-line')).toBeTruthy();
    combo1.unmount();

    const spark = render(<Sparkline data={[1, 3, 2, 5]} />);
    expect(spark.container.querySelector('svg')).toBeTruthy();
  });

  it('cleans up the chart on unmount', () => {
    const { container, unmount } = render(<PieChart data={data} />);
    expect(container.querySelector('svg')).toBeTruthy();
    unmount();
    expect(container.querySelector('svg')).toBeFalsy();
  });

  it('shows a fallback and calls onError when the chart throws', () => {
    let captured: Error | null = null;
    // Empty data makes the core constructor throw.
    const { container } = render(
      <LineChart data={[]} onError={(e) => (captured = e)} />
    );
    expect(captured).toBeTruthy();
    expect(container.textContent).toContain('Chart Error');
  });
});
