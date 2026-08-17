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
import type {
  AreaChartConfig,
  BarChartConfig,
  BaseChartConfig,
  ComboChartConfig,
  FlexibleDataInput,
  LineChartConfig,
  PieChartConfig,
  RadialChartConfig,
  ScatterChartConfig,
  SparklineConfig,
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

/** The supported chart options accepted by a `<chart-lite>` spec. */
export interface ChartSpec extends BaseChartConfig {
  type?: string;
  data?: FlexibleDataInput;
  curve?: LineChartConfig['curve'];
  showPoints?: LineChartConfig['showPoints'];
  orientation?: BarChartConfig['orientation'];
  stacked?: BarChartConfig['stacked'];
  fillOpacity?: AreaChartConfig['fillOpacity'];
  gradient?: AreaChartConfig['gradient'];
  innerRadius?: PieChartConfig['innerRadius'];
  showLabels?: PieChartConfig['showLabels'];
  max?: RadialChartConfig['max'];
  startAngle?: RadialChartConfig['startAngle'];
  endAngle?: RadialChartConfig['endAngle'];
  thickness?: RadialChartConfig['thickness'];
  showValue?: RadialChartConfig['showValue'];
  trackColor?: RadialChartConfig['trackColor'];
  defaultType?: ComboChartConfig['defaultType'];
  pointSize?: ScatterChartConfig['pointSize'];
  labelOffset?: ScatterChartConfig['labelOffset'];
  labelPosition?: ScatterChartConfig['labelPosition'];
  pointShape?: ScatterChartConfig['pointShape'];
  showEndDot?: SparklineConfig['showEndDot'];
  strokeWidth?: SparklineConfig['strokeWidth'];
}

type ChartConfig = Omit<ChartSpec, 'type'>;

const THEMES = ['default', 'midnight', 'minimal', 'tailwind', 'nord', 'high-contrast'] as const;

function parseTheme(value: string | null): BaseChartConfig['theme'] {
  if (value === null) return undefined;
  return THEMES.find((theme) => theme === value);
}

function requiredData(config: ChartConfig): FlexibleDataInput {
  if (config.data === undefined) throw new Error('Chart data is required');
  return config.data;
}

function createChart(
  container: HTMLElement,
  type: string | undefined,
  config: ChartConfig,
): ChartInstance {
  switch (type) {
    case 'line':
      return new LineChart(container, { ...config, data: requiredData(config) });
    case 'bar':
      return new BarChart(container, { ...config, data: requiredData(config) });
    case 'area':
      return new AreaChart(container, { ...config, data: requiredData(config) });
    case 'scatter':
      return new ScatterChart(container, { ...config, data: requiredData(config) });
    case 'pie':
      return new PieChart(container, { ...config, data: requiredData(config) });
    case 'radial':
      return new RadialChart(container, { ...config, data: requiredData(config) });
    case 'combo':
      return new ComboChart(container, { ...config, data: requiredData(config) });
    case 'sparkline':
      return new Sparkline(container, { ...config, data: requiredData(config) });
    default:
      throw new Error(`Unknown chart type: ${String(type)}`);
  }
}

/** Attributes that, when changed, trigger a re-render. */
const OBSERVED = ['spec', 'type', 'data', 'theme', 'title', 'width', 'height', 'css-vars'];

// Keep the module importable during SSR; registration remains browser-only.
// SAFETY: globalThis.HTMLElement is the browser DOM base; SSR uses the inert fallback.
const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

function parseSpecJSON(value: string | null): ChartSpec | undefined {
  if (value == null) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (Object.prototype.toString.call(parsed) !== '[object Object]') return undefined;
    // SAFETY: the object tag check establishes that JSON parsing produced a spec object;
    // chart-specific fields are validated by the core chart constructor.
    return parsed as ChartSpec;
  } catch {
    return undefined;
  }
}

function parseDataJSON(value: string | null): FlexibleDataInput | undefined {
  if (value == null) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export class ChartLiteElement extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return OBSERVED;
  }

  private _spec: ChartSpec | null = null;
  private instance: ChartInstance | null = null;
  private scheduled = false;

  /** Set the full chart spec as a JS property (preferred for dynamic data). */
  set spec(value: ChartSpec | null) {
    this._spec = value;
    this.schedule();
  }
  get spec(): ChartSpec | null {
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
  private resolveSpec(): ChartSpec {
    if (this._spec) return this._spec;

    const attrSpec = parseSpecJSON(this.getAttribute('spec'));
    if (attrSpec !== undefined) return attrSpec;

    const spec: ChartSpec = {};
    const type = this.getAttribute('type');
    if (type) spec.type = type;

    const data = parseDataJSON(this.getAttribute('data'));
    if (data !== undefined) spec.data = data;

    const theme = parseTheme(this.getAttribute('theme'));
    if (theme !== undefined) spec.theme = theme;
    const title = this.getAttribute('title');
    if (title !== null) spec.title = title;
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
      const chart = createChart(this, type, config);
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
  const registry = globalThis.customElements;
  if (registry === undefined) return;
  if (!registry.get(tagName)) {
    registry.define(tagName, ChartLiteElement);
  }
}
