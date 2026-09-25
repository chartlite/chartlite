import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartLiteElement } from '../src'; // auto-registers <chart-lite>

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

/** Wait a microtask so the element's coalesced render runs. */
const flush = () => Promise.resolve();

function createElement(): ChartLiteElement {
  const element = document.createElement('chart-lite');
  if (!(element instanceof ChartLiteElement)) {
    throw new Error('chart-lite was not registered with its public element class');
  }
  return element;
}

describe('<chart-lite>', () => {
  let host: HTMLDivElement;
  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });
  afterEach(() => {
    document.body.removeChild(host);
  });

  it('registers the custom element', () => {
    expect(customElements.get('chart-lite')).toBeTruthy();
  });

  it('renders from a spec set as a JS property', async () => {
    const el = createElement();
    el.spec = { type: 'line', data };
    host.appendChild(el);
    await flush();
    expect(el.querySelector('svg')).toBeTruthy();
  });

  it('renders from attributes (type + JSON data)', async () => {
    const el = document.createElement('chart-lite');
    el.setAttribute('type', 'bar');
    el.setAttribute('data', JSON.stringify(data));
    el.setAttribute('title', 'Sales');
    host.appendChild(el);
    await flush();
    expect(el.querySelector('svg')).toBeTruthy();
    expect(el.querySelector('title')?.textContent).toContain('Sales');
  });

  it('renders a combo chart (bars + line) from a property spec', async () => {
    const el = createElement();
    el.spec = {
      type: 'combo',
      data: {
        series: [
          { name: 'A', dataKey: 'a', type: 'bar' },
          { name: 'B', dataKey: 'b', type: 'line' },
        ],
        data: [
          { x: 'Q1', a: 5, b: 2 },
          { x: 'Q2', a: 8, b: 4 },
        ],
      },
    };
    host.appendChild(el);
    await flush();
    expect(el.querySelector('rect.bar')).toBeTruthy();
    expect(el.querySelector('path.combo-line')).toBeTruthy();
  });

  it('re-renders when the spec property changes', async () => {
    const el = createElement();
    el.spec = { type: 'bar', data };
    host.appendChild(el);
    await flush();
    expect(el.querySelector('rect.bar')).toBeTruthy();
    el.spec = { type: 'line', data };
    await flush();
    expect(el.querySelector('rect.bar')).toBeFalsy();
    expect(el.querySelector('svg')).toBeTruthy();
  });

  it('emits chartlite:render on success', async () => {
    const el = createElement();
    const onRender = vi.fn();
    el.addEventListener('chartlite:render', onRender);
    el.spec = { type: 'pie', data };
    host.appendChild(el);
    await flush();
    expect(onRender).toHaveBeenCalled();
  });

  it('destroys the chart when disconnected', async () => {
    const el = createElement();
    el.spec = { type: 'pie', data };
    host.appendChild(el);
    await flush();
    expect(el.querySelector('svg')).toBeTruthy();
    host.removeChild(el);
    expect(el.querySelector('svg')).toBeFalsy();
  });

  it('shows a fallback and emits chartlite:error on a bad type', async () => {
    const el = createElement();
    const onError = vi.fn();
    el.addEventListener('chartlite:error', onError);
    el.spec = { type: 'donut', data };
    host.appendChild(el);
    await flush();
    expect(el.textContent).toContain('Chart Error');
    expect(onError).toHaveBeenCalled();
  });

  it('updates in place when only spec.data changes', async () => {
    const el = createElement();
    el.spec = { type: 'line', data, theme: 'default' };
    host.appendChild(el);
    await flush();
    const svg = el.querySelector('svg');
    el.spec = { type: 'line', data: [...data, { x: 'Apr', y: 40 }], theme: 'default' };
    await flush();
    expect(el.querySelector('svg')).toBe(svg);
    expect(el.querySelectorAll('.data-point')).toHaveLength(4);

    el.spec = { type: 'line', data, theme: 'midnight' };
    await flush();
    expect(el.querySelector('svg')).toBeTruthy();
    expect(el.querySelector('svg')).not.toBe(svg);
  });

  it('adds a tooltip for the `tooltip` boolean attribute', async () => {
    const el = document.createElement('chart-lite');
    el.setAttribute('type', 'line');
    el.setAttribute('data', JSON.stringify(data));
    el.setAttribute('tooltip', '');
    host.appendChild(el);
    await flush();
    el.querySelector('.data-point')?.dispatchEvent(new MouseEvent('mouseenter'));
    const tip = [...document.body.querySelectorAll('div')].find(
      (div) => div.style.position === 'fixed'
    );
    expect(tip?.textContent).toContain('Jan: 10');
    host.removeChild(el);
    // The tooltip element is removed with the chart.
    expect(
      [...document.body.querySelectorAll('div')].some((div) => div.style.position === 'fixed')
    ).toBe(false);
  });

  it('wires spec.onPointClick without a manual callbacks() plugin', async () => {
    const el = createElement();
    const onPointClick = vi.fn();
    el.spec = { type: 'line', data, onPointClick };
    host.appendChild(el);
    await flush();
    el.querySelector('.data-point')?.dispatchEvent(new MouseEvent('click'));
    expect(onPointClick).toHaveBeenCalledWith(expect.objectContaining({ x: 'Jan', y: 10 }));
  });

  describe('malformed JSON attributes', () => {
    it('names the `data` attribute, logs, and emits chartlite:error', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const el = document.createElement('chart-lite');
      const onError = vi.fn();
      el.addEventListener('chartlite:error', onError);
      el.setAttribute('type', 'line');
      el.setAttribute('data', '[{ x: "Jan", y: 1 }]'); // unquoted keys
      host.appendChild(el);
      await flush();

      expect(onError).toHaveBeenCalledTimes(1);
      const error = onError.mock.calls[0][0].detail;
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/"data" attribute is not valid JSON/);
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('"data" attribute'));
      expect(el.textContent).toContain('"data" attribute');
      consoleError.mockRestore();
    });

    it('names the `spec` attribute', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const el = document.createElement('chart-lite');
      const onError = vi.fn();
      el.addEventListener('chartlite:error', onError);
      el.setAttribute('spec', '{type: line}');
      host.appendChild(el);
      await flush();
      expect(onError.mock.calls[0][0].detail.message).toMatch(/"spec" attribute is not valid JSON/);
      consoleError.mockRestore();
    });

    it('recovers once the attribute is fixed', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const el = document.createElement('chart-lite');
      el.setAttribute('type', 'bar');
      el.setAttribute('data', '[1, 2,');
      host.appendChild(el);
      await flush();
      expect(el.textContent).toContain('Chart Error');
      el.setAttribute('data', '[1, 2, 3]');
      await flush();
      expect(el.querySelector('svg')).toBeTruthy();
      expect(el.textContent).not.toContain('Chart Error');
      consoleError.mockRestore();
    });
  });
});
