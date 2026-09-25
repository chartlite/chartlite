import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRef, StrictMode } from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { tooltip } from '@chartlite/core/interactive';
import {
  Chart,
  LineChart,
  BarChart,
  PieChart,
  ComboChart,
  Sparkline,
  type ChartHandle,
} from '../src';

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

const multiSeries = {
  series: [
    { name: 'A', dataKey: 'a' },
    { name: 'B', dataKey: 'b' },
  ],
  data: [
    { x: 'Q1', a: 5, b: 2 },
    { x: 'Q2', a: 8, b: 4 },
  ],
};

afterEach(() => {
  cleanup();
  // Tooltip plugins append their element to <body>; keep tests independent.
  document.body.innerHTML = '';
});

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

  it('works under StrictMode (mount → unmount → remount)', () => {
    const { container } = render(
      <StrictMode>
        <LineChart data={data} />
      </StrictMode>
    );
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  describe('errors', () => {
    it('shows a fallback inside the container and calls onError', () => {
      let captured: Error | null = null;
      // Empty data makes the core constructor throw.
      const { container } = render(
        <LineChart data={[]} className="chart" onError={(e) => (captured = e)} />
      );
      expect(captured).toBeTruthy();
      const host = container.querySelector('div.chart');
      expect(host).toBeTruthy();
      expect(host?.querySelector('[role="alert"]')?.textContent).toContain('Chart Error');
    });

    it('recovers when valid data arrives after an error', () => {
      const onError = vi.fn();
      const { container, rerender } = render(
        <LineChart data={[]} className="chart" onError={onError} />
      );
      expect(onError).toHaveBeenCalledTimes(1);
      expect(container.textContent).toContain('Chart Error');

      rerender(<LineChart data={data} className="chart" onError={onError} />);
      const host = container.querySelector('div.chart');
      expect(host?.querySelector('svg')).toBeTruthy();
      expect(container.textContent).not.toContain('Chart Error');
    });

    it('does not retry (or re-report) a failed chart on an unrelated re-render', () => {
      const onError = vi.fn();
      const { rerender } = render(<LineChart data={[]} onError={onError} />);
      rerender(<LineChart data={[]} onError={() => onError()} />);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('recovers when an in-place data update fails and then succeeds', () => {
      const onError = vi.fn();
      const { container, rerender } = render(<LineChart data={data} onError={onError} />);
      rerender(<LineChart data={[]} onError={onError} />);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(container.querySelector('svg')).toBeFalsy();
      rerender(<LineChart data={data} onError={onError} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  describe('updates', () => {
    it('does not recreate the chart for new inline callback/formatter/plugin identities', () => {
      const view = (n: number) => (
        <LineChart
          data={[...data]}
          onPointClick={() => n}
          onHover={() => n}
          valueFormatter={(value) => `$${value}`}
          plugins={[tooltip()]}
        />
      );
      const { container, rerender } = render(view(1));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      rerender(view(2));
      rerender(view(3));
      expect(container.querySelector('svg')).toBe(svg);
    });

    it('calls the latest callback without recreating the chart', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { container, rerender } = render(<LineChart data={data} onPointClick={first} />);
      const svg = container.querySelector('svg');
      rerender(<LineChart data={data} onPointClick={second} />);
      expect(container.querySelector('svg')).toBe(svg);

      const point = container.querySelector('.data-point');
      expect(point).toBeTruthy();
      fireEvent.click(point!);
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
      expect(second.mock.calls[0][0]).toMatchObject({ x: 'Jan', y: 10 });
    });

    it('updates in place (chart.update) when only data changes', () => {
      const ref = createRef<ChartHandle>();
      const { container, rerender } = render(<LineChart ref={ref} data={data} />);
      const chart = ref.current?.chart;
      const svg = container.querySelector('svg');
      const update = vi.spyOn(chart!, 'update');

      rerender(<LineChart ref={ref} data={[...data, { x: 'Apr', y: 40 }]} />);
      expect(update).toHaveBeenCalledTimes(1);
      expect(ref.current?.chart).toBe(chart);
      expect(container.querySelector('svg')).toBe(svg);
      expect(container.querySelectorAll('.data-point')).toHaveLength(4);

      // An equal-but-new data array is a no-op.
      rerender(<LineChart ref={ref} data={[...data, { x: 'Apr', y: 40 }]} />);
      expect(update).toHaveBeenCalledTimes(1);
    });

    it('recreates the chart when a non-data option changes', () => {
      const ref = createRef<ChartHandle>();
      const { rerender } = render(<LineChart ref={ref} data={data} theme="default" />);
      const chart = ref.current?.chart;
      rerender(<LineChart ref={ref} data={data} theme="midnight" />);
      expect(ref.current?.chart).toBeTruthy();
      expect(ref.current?.chart).not.toBe(chart);
    });

    it('re-renders when the formatter logic changes (different source)', () => {
      const { container, rerender } = render(
        <LineChart data={data} valueFormatter={(value) => `old-${value}`} />
      );
      expect(container.textContent).toContain('old-20');
      rerender(<LineChart data={data} valueFormatter={(value) => `new-${value}`} />);
      expect(container.textContent).toContain('new-20');
      expect(container.textContent).not.toContain('old-20');
    });
  });

  describe('interactivity', () => {
    it('`tooltip` adds the tooltip plugin', () => {
      const { container } = render(<LineChart data={data} tooltip />);
      fireEvent.pointerMove(container.querySelector('.data-point')!);
      const tip = [...document.body.querySelectorAll('div')].find(
        (el) => el.style.position === 'fixed'
      );
      expect(tip?.textContent).toMatch(/Jan.*10/);
    });

    it('`tooltip` options use the latest formatter', () => {
      const { container, rerender } = render(
        <LineChart data={data} tooltip={{ formatter: (e) => `a ${e.y}` }} />
      );
      rerender(<LineChart data={data} tooltip={{ formatter: (e) => `b ${e.y}` }} />);
      fireEvent.pointerMove(container.querySelector('.data-point')!);
      const tip = [...document.body.querySelectorAll('div')].find(
        (el) => el.style.position === 'fixed'
      );
      expect(tip?.textContent).toBe('b 10');
    });

    it('does not add a second tooltip when one is already in plugins', () => {
      const { container } = render(<LineChart data={data} tooltip plugins={[tooltip()]} />);
      fireEvent.pointerMove(container.querySelector('.data-point')!);
      const tips = [...document.body.querySelectorAll('div')].filter(
        (el) => el.style.position === 'fixed'
      );
      expect(tips).toHaveLength(1);
    });

    it('adds callbacks() automatically for onHover', () => {
      const onHover = vi.fn();
      const { container } = render(<LineChart data={data} onHover={onHover} />);
      const point = container.querySelector('.data-point')!;
      fireEvent.pointerMove(point);
      fireEvent.pointerLeave(container.querySelector('svg')!);
      expect(onHover).toHaveBeenCalledTimes(2);
      expect(onHover.mock.calls[1][0]).toBeNull();
    });

    it('adds legendToggle() automatically for onLegendToggle', () => {
      const onLegendToggle = vi.fn();
      const { container } = render(
        <BarChart data={multiSeries} legend={{ show: true }} onLegendToggle={onLegendToggle} />
      );
      fireEvent.click(container.querySelector('.legend-item')!);
      expect(onLegendToggle).toHaveBeenCalledWith(
        expect.objectContaining({ seriesName: 'A', seriesIndex: 0, hidden: true })
      );
    });
  });

  describe('ref and container props', () => {
    it('exposes the chart instance and toSVG() via ref', () => {
      const ref = createRef<ChartHandle>();
      render(<LineChart ref={ref} data={data} />);
      expect(ref.current?.chart).toBeTruthy();
      expect(ref.current?.container).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.toSVG()).toMatch(/^<svg/);
    });

    it('generic <Chart> forwards a ref too', () => {
      const ref = createRef<ChartHandle>();
      render(<Chart ref={ref} type="bar" data={data} />);
      expect(ref.current?.toSVG()).toMatch(/^<svg/);
    });

    it('ref.toSVG() throws while the chart is in an error state', () => {
      const ref = createRef<ChartHandle>();
      render(<LineChart ref={ref} data={[]} onError={() => {}} />);
      expect(ref.current?.chart).toBeNull();
      expect(ref.current?.error).toBeInstanceOf(Error);
      expect(() => ref.current?.toSVG()).toThrow();
    });

    it('passes id, className, style, aria-* and data-* to the container', () => {
      const { container } = render(
        <LineChart
          data={data}
          id="revenue"
          className="chart"
          style={{ width: 320 }}
          aria-describedby="caption"
          data-testid="revenue-chart"
        />
      );
      const host = container.firstElementChild;
      if (!(host instanceof HTMLElement)) throw new Error('expected a container element');
      expect(host.id).toBe('revenue');
      expect(host.className).toBe('chart');
      expect(host.style.width).toBe('320px');
      expect(host.getAttribute('aria-describedby')).toBe('caption');
      expect(host.getAttribute('data-testid')).toBe('revenue-chart');
      expect(host.querySelector('svg')).toBeTruthy();
    });
  });
});
