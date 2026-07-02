import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { Chart, LineChart, BarChart, PieChart, ComboChart, Sparkline } from '../src';

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

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
    const wrapper = mount(LineChart, { attrs: { data } });
    expect(wrapper.find('svg').exists()).toBe(true);
    wrapper.unmount();
  });

  it('passes config through (title/theme) to the core chart', () => {
    const wrapper = mount(BarChart, { attrs: { data, title: 'Sales', theme: 'midnight' } });
    expect(wrapper.find('title').text()).toContain('Sales');
    wrapper.unmount();
  });

  it('renders combo bar + line shapes via the named component', () => {
    const combo = {
      series: [
        { name: 'A', dataKey: 'a', type: 'bar' },
        { name: 'B', dataKey: 'b', type: 'line' },
      ],
      data: [
        { x: 'Q1', a: 5, b: 2 },
        { x: 'Q2', a: 8, b: 4 },
      ],
    };
    const wrapper = mount(ComboChart, { attrs: { data: combo } });
    expect(wrapper.find('rect.bar').exists()).toBe(true);
    expect(wrapper.find('path.combo-line').exists()).toBe(true);
    wrapper.unmount();
  });

  it('recreates the chart when reactive data changes', async () => {
    const wrapper = mount(Sparkline, { attrs: { data: [1, 2, 3] } });
    expect(wrapper.find('svg').exists()).toBe(true);
    await wrapper.setProps({ data: [5, 4, 3, 2, 1] });
    expect(wrapper.find('svg').exists()).toBe(true);
    wrapper.unmount();
  });

  it('destroys the chart on unmount', () => {
    const wrapper = mount(PieChart, { attrs: { data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('svg')).toBeTruthy();
    wrapper.unmount();
    expect(el.querySelector('svg')).toBeFalsy();
  });

  it('shows a fallback and calls onError when the chart throws', async () => {
    let captured: Error | null = null;
    const wrapper = mount(LineChart, {
      attrs: { data: [], onError: (e: Error) => (captured = e) },
    });
    // onError fires synchronously during the mount build; the fallback box paints
    // on the next reactive tick.
    expect(captured).toBeTruthy();
    await nextTick();
    expect(wrapper.text()).toContain('Chart Error');
    wrapper.unmount();
  });
});
