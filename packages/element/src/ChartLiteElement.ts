/**
 * `<chart-lite>` — a framework-agnostic custom element for Chartlite.
 *
 * It renders any chart type from a `ChartSpec`, supplied either as a JS property
 * (`el.spec = { type: 'line', data }`) or as attributes for static HTML
 * (`<chart-lite type="line" data="[1,2,3]">`). Because it's a standard custom
 * element, it works in plain HTML, Astro/Hugo/11ty, and any framework — including
 * Angular (`<chart-lite [spec]="spec">` with `CUSTOM_ELEMENTS_SCHEMA`).
 */

import {
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  PieChart,
  RadialChart,
  ComboChart,
  Sparkline,
} from '@chartlite/core';

export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'scatter'
  | 'pie'
  | 'radial'
  | 'combo'
  | 'sparkline';

interface ChartInstance {
  render(): void;
  destroy(): void;
}
type ChartConstructor = new (el: HTMLElement, config: Record<string, unknown>) => ChartInstance;

const REGISTRY: Record<ChartType, ChartConstructor> = {
  line: LineChart as unknown as ChartConstructor,
  bar: BarChart as unknown as ChartConstructor,
  area: AreaChart as unknown as ChartConstructor,
  scatter: ScatterChart as unknown as ChartConstructor,
  pie: PieChart as unknown as ChartConstructor,
  radial: RadialChart as unknown as ChartConstructor,
  combo: ComboChart as unknown as ChartConstructor,
  sparkline: Sparkline as unknown as ChartConstructor,
};

/** Attributes that, when changed, trigger a re-render. */
const OBSERVED = ['spec', 'type', 'data', 'theme', 'title', 'width', 'height', 'css-vars'];

function parseJSON(value: string | null): unknown {
  if (value == null) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export class ChartLiteElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return OBSERVED;
  }

  private _spec: Record<string, unknown> | null = null;
  private instance: ChartInstance | null = null;
  private scheduled = false;

  /** Set the full chart spec as a JS property (preferred for dynamic data). */
  set spec(value: Record<string, unknown> | null) {
    this._spec = value;
    this.schedule();
  }
  get spec(): Record<string, unknown> | null {
    return this._spec;
  }

  connectedCallback(): void {
    this.schedule();
  }

  disconnectedCallback(): void {
    this.instance?.destroy();
    this.instance = null;
  }

  attributeChangedCallback(): void {
    this.schedule();
  }

  /** Coalesce multiple synchronous attribute changes into one render. */
  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      this.rerender();
    });
  }

  /** Merge the property spec (wins) with any attribute-derived spec. */
  private resolveSpec(): Record<string, unknown> {
    if (this._spec) return this._spec;

    const attrSpec = parseJSON(this.getAttribute('spec'));
    if (attrSpec && typeof attrSpec === 'object') {
      return attrSpec as Record<string, unknown>;
    }

    const spec: Record<string, unknown> = {};
    const type = this.getAttribute('type');
    if (type) spec.type = type;

    const data = parseJSON(this.getAttribute('data'));
    if (data !== undefined) spec.data = data;

    for (const key of ['theme', 'title'] as const) {
      const value = this.getAttribute(key);
      if (value != null) spec[key] = value;
    }
    for (const key of ['width', 'height'] as const) {
      const value = this.getAttribute(key);
      if (value != null && value !== '') spec[key] = Number(value);
    }
    if (this.hasAttribute('css-vars')) spec.cssVars = true;

    return spec;
  }

  private showError(message: string): void {
    this.textContent = '';
    const box = document.createElement('div');
    box.setAttribute(
      'style',
      'padding:20px;color:#dc2626;border:1px solid #fecaca;border-radius:4px;background-color:#fee2e2'
    );
    const strong = document.createElement('strong');
    strong.textContent = 'Chart Error: ';
    box.appendChild(strong);
    box.append(message);
    this.appendChild(box);
  }

  private rerender(): void {
    if (!this.isConnected) return;
    const { type, ...config } = this.resolveSpec();
    try {
      this.instance?.destroy();
      this.instance = null;
      this.textContent = '';
      const Ctor = REGISTRY[type as ChartType];
      if (!Ctor) throw new Error(`Unknown chart type: ${String(type)}`);
      const chart = new Ctor(this, config);
      chart.render();
      this.instance = chart;
      this.dispatchEvent(new CustomEvent('chartlite:render', { detail: { type } }));
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error(String(err));
      this.showError(normalized.message);
      this.dispatchEvent(new CustomEvent('chartlite:error', { detail: normalized }));
    }
  }
}

/**
 * Register the custom element (default tag `chart-lite`). Safe to call multiple
 * times and a no-op where `customElements` is unavailable (e.g. SSR/Node).
 */
export function defineChartElement(tagName = 'chart-lite'): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ChartLiteElement);
  }
}
