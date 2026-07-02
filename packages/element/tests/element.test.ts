import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../src'; // auto-registers <chart-lite>

const data = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

/** Wait a microtask so the element's coalesced render runs. */
const flush = () => Promise.resolve();

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
    const el = document.createElement('chart-lite') as HTMLElement & {
      spec: Record<string, unknown>;
    };
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
    const el = document.createElement('chart-lite') as HTMLElement & {
      spec: Record<string, unknown>;
    };
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
    const el = document.createElement('chart-lite') as HTMLElement & {
      spec: Record<string, unknown>;
    };
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
    const el = document.createElement('chart-lite') as HTMLElement & {
      spec: Record<string, unknown>;
    };
    const onRender = vi.fn();
    el.addEventListener('chartlite:render', onRender);
    el.spec = { type: 'pie', data };
    host.appendChild(el);
    await flush();
    expect(onRender).toHaveBeenCalled();
  });

  it('destroys the chart when disconnected', async () => {
    const el = document.createElement('chart-lite') as HTMLElement & {
      spec: Record<string, unknown>;
    };
    el.spec = { type: 'pie', data };
    host.appendChild(el);
    await flush();
    expect(el.querySelector('svg')).toBeTruthy();
    host.removeChild(el);
    expect(el.querySelector('svg')).toBeFalsy();
  });

  it('shows a fallback and emits chartlite:error on a bad type', async () => {
    const el = document.createElement('chart-lite') as HTMLElement & {
      spec: Record<string, unknown>;
    };
    const onError = vi.fn();
    el.addEventListener('chartlite:error', onError);
    el.spec = { type: 'donut', data };
    host.appendChild(el);
    await flush();
    expect(el.textContent).toContain('Chart Error');
    expect(onError).toHaveBeenCalled();
  });
});
