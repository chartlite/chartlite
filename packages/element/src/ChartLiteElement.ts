/**
 * `<chart-lite>` — a framework-agnostic custom element for Chartlite.
 *
 * It renders any chart type from a `ChartSpec`, supplied either as a JS property
 * (`el.spec = { type: 'line', data }`) or as attributes for static HTML
 * (`<chart-lite type="line" data="[1,2,3]">`). Because it's a standard custom
 * element, it works in plain HTML, Astro/Hugo/11ty, and any framework — including
 * Angular (`<chart-lite [spec]="spec">` with `CUSTOM_ELEMENTS_SCHEMA`).
 *
 * - `tooltip` (boolean attribute) or `spec.tooltip` adds a hover tooltip.
 * - A spec change that only touches `data` updates the chart in place
 *   (`chart.update`); callbacks such as `spec.onPointClick` are picked up without
 *   re-rendering; any other change recreates the chart.
 * - Errors (including a malformed JSON `spec`/`data` attribute, which is named in
 *   the message and logged via `console.error`) show a fallback box and dispatch
 *   a `chartlite:error` event whose `detail` is the `Error`.
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
import type { TooltipOptions } from '@chartlite/core/interactive';
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
import { ChartController, type ChartConstructor, type CoreConfig } from './bridge';

export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'scatter'
  | 'pie'
  | 'radial'
  | 'combo'
  | 'sparkline';

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
  /** Hover tooltip (`true` or options). Adds `tooltip()` from `@chartlite/core/interactive`. */
  tooltip?: boolean | TooltipOptions;
}

const THEMES = ['default', 'midnight', 'minimal', 'tailwind', 'nord', 'high-contrast'] as const;

function parseTheme(value: string | null): BaseChartConfig['theme'] {
  if (value === null) return undefined;
  return THEMES.find((theme) => theme === value);
}

const REGISTRY = {
  line: LineChart,
  bar: BarChart,
  area: AreaChart,
  scatter: ScatterChart,
  pie: PieChart,
  radial: RadialChart,
  combo: ComboChart,
  sparkline: Sparkline,
};

function lookup(type: string | undefined): ChartConstructor<CoreConfig> | undefined {
  if (type === undefined || !Object.prototype.hasOwnProperty.call(REGISTRY, type)) return undefined;
  // SAFETY: `type` is an own key of REGISTRY (checked above); the spec's options
  // are validated by that chart's constructor.
  return REGISTRY[type as ChartType] as ChartConstructor<CoreConfig>;
}

/** Attributes that, when changed, trigger a re-render. */
const OBSERVED = ['spec', 'type', 'data', 'theme', 'title', 'width', 'height', 'css-vars', 'tooltip'];

// Keep the module importable during SSR; registration remains browser-only.
// SAFETY: globalThis.HTMLElement is the browser DOM base; SSR uses the inert fallback.
const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

/** Parse a JSON attribute, naming the attribute in the error if it is malformed. */
function parseJSONAttribute(name: string, value: string): ChartSpec | FlexibleDataInput {
  try {
    return JSON.parse(value);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`<chart-lite>: the "${name}" attribute is not valid JSON (${reason})`);
  }
}

function parseSpecAttribute(value: string): ChartSpec {
  const parsed = parseJSONAttribute('spec', value);
  if (Object.prototype.toString.call(parsed) !== '[object Object]') {
    throw new Error('<chart-lite>: the "spec" attribute must be a JSON object, e.g. {"type":"line","data":[1,2,3]}');
  }
  // SAFETY: the object tag check establishes that JSON parsing produced a spec object;
  // chart-specific fields are validated by the core chart constructor.
  return parsed as ChartSpec;
}

function parseDataAttribute(value: string): FlexibleDataInput {
  // SAFETY: JSON data is validated (and rejected with a clear error) by the core
  // chart's data normalization.
  return parseJSONAttribute('data', value) as FlexibleDataInput;
}

export class ChartLiteElement extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return OBSERVED;
  }

  private _spec: ChartSpec | null = null;
  private readonly controller = new ChartController();
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
    this.controller.destroy();
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

    const specAttr = this.getAttribute('spec');
    if (specAttr !== null) return parseSpecAttribute(specAttr);

    const spec: ChartSpec = {};
    const type = this.getAttribute('type');
    if (type) spec.type = type;

    const data = this.getAttribute('data');
    if (data !== null) spec.data = parseDataAttribute(data);

    const theme = parseTheme(this.getAttribute('theme'));
    if (theme !== undefined) spec.theme = theme;
    const title = this.getAttribute('title');
    if (title !== null) spec.title = title;
    for (const key of ['width', 'height'] as const) {
      const value = this.getAttribute(key);
      if (value != null && value !== '') spec[key] = Number(value);
    }
    if (this.hasAttribute('css-vars')) spec.cssVars = true;
    if (this.hasAttribute('tooltip')) spec.tooltip = true;

    return spec;
  }

  private rerender(): void {
    if (!this.isConnected) return;
    const onError = (error: Error): void => {
      this.dispatchEvent(new CustomEvent('chartlite:error', { detail: error }));
    };

    let spec: ChartSpec;
    try {
      spec = this.resolveSpec();
    } catch (err) {
      // Malformed JSON attributes: say which attribute failed instead of letting
      // it surface later as a vague data-format error.
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error.message);
      this.controller.fail(this, error, { onError });
      return;
    }

    const { type, tooltip, ...config } = spec;
    // SAFETY: the spec's options are the chart config; a missing `data` is
    // reported by the controller and the rest is validated by the core chart.
    const error = this.controller.sync(this, lookup(type), config as CoreConfig, {
      tooltip,
      onError,
      type,
    });
    if (!error) this.dispatchEvent(new CustomEvent('chartlite:render', { detail: { type } }));
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
