import { describe, it, expect, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import type { ChartPlugin } from '@chartlite/core';
import { tooltip } from '@chartlite/core/interactive';
import {
  Chart,
  LineChart,
  BarChart,
  PieChart,
  RadialChart,
  ComboChart,
  Sparkline,
} from '../src';

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

function fixedTooltips(): HTMLElement[] {
  return [...document.body.querySelectorAll('div')].filter((el) => el.style.position === 'fixed');
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('@chartlite/vue', () => {
  it('generic <Chart> renders an SVG for a given type', () => {
    const wrapper = mount(Chart, { attrs: { type: 'line', data } });
    expect(wrapper.find('svg').exists()).toBe(true);
    wrapper.unmount();
  });

  it('generic <Chart> covers the newer types (pie, radial, combo, sparkline)', () => {
    const combo = {
      series: [
        { name: 'Rev', dataKey: 'rev', type: 'bar' },
        { name: 'Trend', dataKey: 'trend', type: 'line' },
      ],
      data: [
        { x: 'Jan', rev: 10, trend: 4 },
        { x: 'Feb', rev: 20, trend: 8 },
      ],
    };
    const cases = [
      { type: 'pie', data },
      { type: 'radial', data: [{ x: 'Score', y: 70 }], max: 100 },
      { type: 'combo', data: combo },
      { type: 'sparkline', data: [1, 2, 3, 2, 4] },
    ];
    for (const attrs of cases) {
      const wrapper = mount(Chart, { attrs });
      expect(wrapper.find('svg').exists()).toBe(true);
      wrapper.unmount();
    }
  });

  it('named components render their chart type', () => {
    const wrapper = mount(LineChart, { props: { data } });
    expect(wrapper.find('svg').exists()).toBe(true);
    wrapper.unmount();
  });

  it('passes config through (title/theme) to the core chart', () => {
    const wrapper = mount(BarChart, { props: { data, title: 'Sales', theme: 'midnight' } });
    expect(wrapper.find('title').text()).toContain('Sales');
    wrapper.unmount();
  });

  it('recreates when the generic constructor changes', async () => {
    const wrapper = mount(Chart, { props: { type: 'line', data } });
    await wrapper.setProps({ type: 'bar' });
    expect(wrapper.find('rect.bar').exists()).toBe(true);
    wrapper.unmount();
  });

  it('re-renders when the formatter logic changes (different source)', async () => {
    const wrapper = mount(LineChart, {
      props: { data, valueFormatter: (value: number) => `old-${value}` },
    });
    expect(wrapper.text()).toContain('old-20');
    await wrapper.setProps({ valueFormatter: (value: number) => `new-${value}` });
    expect(wrapper.text()).toContain('new-20');
    expect(wrapper.text()).not.toContain('old-20');
    wrapper.unmount();
  });

  it('renders combo bar + line shapes via the named component', () => {
    const combo = {
      series: [
        { name: 'A', dataKey: 'a', type: 'bar' as const },
        { name: 'B', dataKey: 'b', type: 'line' as const },
      ],
      data: [
        { x: 'Q1', a: 5, b: 2 },
        { x: 'Q2', a: 8, b: 4 },
      ],
    };
    const wrapper = mount(ComboChart, { props: { data: combo } });
    expect(wrapper.find('rect.bar').exists()).toBe(true);
    expect(wrapper.find('path.combo-line').exists()).toBe(true);
    wrapper.unmount();
  });

  it('destroys the chart on unmount', () => {
    const wrapper = mount(PieChart, { props: { data } });
    const el = wrapper.element;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.querySelector('svg')).toBeTruthy();
    wrapper.unmount();
    expect(el.querySelector('svg')).toBeFalsy();
  });

  describe('errors', () => {
    it('shows a fallback inside the container and calls onError', async () => {
      let captured: Error | null = null;
      const wrapper = mount(LineChart, {
        props: { data: [], onError: (e: Error) => (captured = e) },
        attrs: { class: 'chart' },
      });
      expect(captured).toBeTruthy();
      await nextTick();
      expect(wrapper.classes()).toContain('chart');
      expect(wrapper.find('[role="alert"]').text()).toContain('Chart Error');
      wrapper.unmount();
    });

    it('recovers when valid data arrives after an error', async () => {
      const onError = vi.fn();
      const wrapper = mount(LineChart, { props: { data: [], onError } });
      expect(onError).toHaveBeenCalledTimes(1);
      expect(wrapper.text()).toContain('Chart Error');

      await wrapper.setProps({ data });
      expect(wrapper.find('svg').exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Chart Error');
      expect(onError).toHaveBeenCalledTimes(1);
      wrapper.unmount();
    });
  });

  describe('attribute normalization', () => {
    it('camelizes kebab-case attributes (`show-points`, `css-vars`)', () => {
      const wrapper = mount(LineChart, {
        attrs: { data, 'show-points': false, 'css-vars': '' },
      });
      // Points stay as transparent hit targets; no visible markers are drawn.
      const points = wrapper.findAll('.data-point');
      expect(points.length).toBeGreaterThan(0);
      points.forEach((point) => expect(point.attributes('fill')).toBe('transparent'));
      expect(wrapper.find('svg').html()).toContain('var(--cl-');
      wrapper.unmount();
    });

    it('treats bare boolean attributes as `true`', () => {
      const wrapper = mount(LineChart, { attrs: { data, cssVars: '' } });
      expect(wrapper.find('svg').html()).toContain('var(--cl-');
      wrapper.unmount();
    });

    it('camelizes undeclared fall-through attributes too', () => {
      let seen: boolean | undefined;
      const probe: ChartPlugin = {
        name: 'probe',
        afterRender(ctx) {
          seen = 'futureFlag' in ctx.config && ctx.config.futureFlag === true;
        },
      };
      const wrapper = mount(LineChart, { attrs: { data, plugins: [probe], 'future-flag': '' } });
      expect(seen).toBe(true);
      wrapper.unmount();
    });

    it('passes `start-angle` / `end-angle` to a radial chart', () => {
      const full = mount(RadialChart, { attrs: { data: [{ x: 'A', y: 50 }] } });
      const half = mount(RadialChart, {
        attrs: { data: [{ x: 'A', y: 50 }], 'start-angle': -90, 'end-angle': 90 },
      });
      expect(half.find('svg').html()).not.toBe(full.find('svg').html());
      full.unmount();
      half.unmount();
    });

    it("keeps Sparkline's own `type` (line/area) on the named component", () => {
      const line = mount(Sparkline, { props: { data: [1, 3, 2] } });
      const area = mount(Sparkline, { props: { data: [1, 3, 2], type: 'area' } });
      expect(line.findAll('g.chart-main path')).toHaveLength(1);
      expect(area.findAll('g.chart-main path')).toHaveLength(2);
      line.unmount();
      area.unmount();
    });

    it('puts class, style, id, aria-* and data-* on the container', () => {
      const wrapper = mount(LineChart, {
        props: { data },
        attrs: {
          class: 'chart',
          style: 'width: 320px',
          id: 'revenue',
          'aria-describedby': 'caption',
          'data-testid': 'revenue-chart',
        },
      });
      const el = wrapper.element;
      if (!(el instanceof HTMLElement)) throw new Error('expected an element');
      expect(el.className).toBe('chart');
      expect(el.style.width).toBe('320px');
      expect(el.id).toBe('revenue');
      expect(el.getAttribute('aria-describedby')).toBe('caption');
      expect(el.getAttribute('data-testid')).toBe('revenue-chart');
      wrapper.unmount();
    });
  });

  describe('updates', () => {
    it('does not recreate the chart for new callback / plugin identities', async () => {
      const first = vi.fn();
      const second = vi.fn();
      const wrapper = mount(LineChart, {
        props: { data, onPointClick: first, plugins: [tooltip()] },
      });
      const svg = wrapper.find('svg').element;
      await wrapper.setProps({ onPointClick: second, plugins: [tooltip()] });
      expect(wrapper.find('svg').element).toBe(svg);

      await wrapper.find('.data-point').trigger('click');
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
      wrapper.unmount();
    });

    it('updates in place (chart.update) when only data changes', async () => {
      const wrapper = mount(LineChart, { props: { data } });
      const chart = wrapper.vm.chart;
      expect(chart).toBeTruthy();
      const update = vi.spyOn(chart!, 'update');
      await wrapper.setProps({ data: [...data, { x: 'Apr', y: 40 }] });
      expect(update).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.chart).toBe(chart);
      expect(wrapper.findAll('.data-point')).toHaveLength(4);

      // Equal-but-new data is a no-op.
      await wrapper.setProps({ data: [...data, { x: 'Apr', y: 40 }] });
      expect(update).toHaveBeenCalledTimes(1);
      wrapper.unmount();
    });

    it('recreates the chart when a non-data option changes', async () => {
      const wrapper = mount(LineChart, { props: { data, theme: 'default' } });
      const chart = wrapper.vm.chart;
      await wrapper.setProps({ theme: 'midnight' });
      expect(wrapper.vm.chart).toBeTruthy();
      expect(wrapper.vm.chart).not.toBe(chart);
      wrapper.unmount();
    });
  });

  describe('interactivity', () => {
    it('`tooltip` boolean shorthand adds the tooltip plugin', async () => {
      const wrapper = mount(LineChart, { attrs: { data, tooltip: '' } });
      wrapper.find('.data-point').element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
      expect(fixedTooltips()).toHaveLength(1);
      expect(fixedTooltips()[0].textContent).toMatch(/Jan.*10/);
      wrapper.unmount();
    });

    it('`@point-click` works without installing callbacks() manually', async () => {
      const onPointClick = vi.fn();
      // `@point-click="fn"` compiles to the `onPointClick` prop.
      const wrapper = mount(LineChart, { attrs: { data, onPointClick } });
      await wrapper.find('.data-point').trigger('click');
      expect(onPointClick).toHaveBeenCalledWith(expect.objectContaining({ x: 'Jan', y: 10 }));
      wrapper.unmount();
    });

    it('undeclared listeners like `@click` bind on the container', async () => {
      const onClick = vi.fn();
      const wrapper = mount(LineChart, { attrs: { data, onClick } });
      await wrapper.trigger('click');
      expect(onClick).toHaveBeenCalledTimes(1);
      wrapper.unmount();
    });
  });

  describe('expose', () => {
    it('exposes chart, container and toSVG()', () => {
      const wrapper = mount(LineChart, { props: { data } });
      expect(wrapper.vm.chart).toBeTruthy();
      expect(wrapper.vm.container).toBe(wrapper.element);
      expect(wrapper.vm.toSVG()).toMatch(/^<svg/);
      wrapper.unmount();
    });
  });
});
