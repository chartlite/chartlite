/**
 * Framework-agnostic bridge between a wrapper component and a core chart.
 *
 * NOTE: this file is intentionally duplicated verbatim in every wrapper package
 * (react, vue, svelte, element) so each stays a single self-contained module
 * with no extra shared package. Keep the copies in sync.
 *
 * Responsibilities:
 * - Function-valued options (`onPointClick`, `onHover`, `onLegendToggle`,
 *   `valueFormatter`, tooltip `formatter`, `onError`) are read through stable
 *   proxies that always call the latest function, so new callback identities
 *   (inline arrows) never recreate the chart.
 * - When only `data` changed, the chart is updated in place via `chart.update()`.
 * - Any other option change (or a new chart constructor) recreates the chart.
 *   `plugins` are compared by their `name` list, not by array/object identity.
 * - The `tooltip` wrapper option adds `tooltip()`; supplying `onPointClick` /
 *   `onHover` adds `callbacks()`, and `onLegendToggle` adds `legendToggle()`,
 *   unless a plugin with that name is already installed.
 * - Errors render a fallback box *inside* the container, which always stays
 *   mounted, so the chart recovers as soon as valid options arrive.
 */

import {
  callbacks,
  legendToggle,
  tooltip,
  type TooltipOptions,
} from '@chartlite/core/interactive';
import type {
  BaseChartConfig,
  Chart,
  ChartPlugin,
  ChartPointEvent,
  FlexibleDataInput,
  LegendToggleEvent,
} from '@chartlite/core';

/** The live core chart instance (`render`, `update`, `destroy`, `toSVG`). */
export type ChartInstance = Chart;

/** Options every wrapper accepts on top of the core chart config. */
export interface WrapperOptions {
  /**
   * Show a hover tooltip. `true` uses the defaults; an object configures it
   * (see `TooltipOptions` from `@chartlite/core/interactive`). Adds the
   * `tooltip()` plugin unless one is already in `plugins`.
   */
  tooltip?: boolean | TooltipOptions;
}

/** Wrapper-level settings passed alongside the core config. */
export interface BridgeOptions extends WrapperOptions {
  /** Called when the chart throws while rendering or updating. */
  onError?: (error: Error) => void;
  /** Chart type label, used in the "unknown chart type" error message. */
  type?: string;
}

/** The core config fields the bridge relies on. */
export type CoreConfig = BaseChartConfig & { data: FlexibleDataInput };

/** Any core chart constructor: `new Ctor(container, config)`. */
export type ChartConstructor<C extends CoreConfig> = new (
  container: HTMLElement,
  config: C
) => ChartInstance;

interface LatestHandlers {
  onPointClick?: (event: ChartPointEvent) => void;
  onHover?: (event: ChartPointEvent | null) => void;
  onLegendToggle?: (event: LegendToggleEvent) => void;
  valueFormatter?: (value: number) => string;
  tooltipFormatter?: (event: ChartPointEvent) => string;
  onError?: (error: Error) => void;
}

const identities = new WeakMap<WeakKey, number>();
let nextIdentity = 0;

function identity(value: WeakKey): number {
  let id = identities.get(value);
  if (id === undefined) {
    id = ++nextIdentity;
    identities.set(value, id);
  }
  return id;
}

type TooltipKey = boolean | (Omit<TooltipOptions, 'formatter'> & { formatter: boolean });

/** Values folded into a change-detection key. */
type KeyPart = string | boolean | TooltipKey | FlexibleDataInput | Partial<CoreConfig>;

/** JSON key for change detection; functions not handled by a proxy compare by identity. */
function stableKey(value: KeyPart | readonly KeyPart[], owner: WeakKey): string {
  try {
    return (
      JSON.stringify(value, (_key, item) =>
        item instanceof Function ? `__chartlite_fn_${identity(item)}` : item
      ) ?? ''
    );
  } catch {
    return `__chartlite_ref_${identity(owner)}`;
  }
}

function tooltipKey(option: WrapperOptions['tooltip']): TooltipKey {
  if (option === undefined || option === false) return false;
  if (option === true) return true;
  return { ...option, formatter: option.formatter !== undefined };
}

/** Everything except data and proxied functions: a change here recreates the chart. */
function structureKey(config: CoreConfig, options: BridgeOptions): string {
  const {
    data: _data,
    plugins,
    onPointClick,
    onHover,
    onLegendToggle,
    valueFormatter,
    ...rest
  } = config;
  return stableKey(
    [
      rest,
      (plugins ?? []).map((plugin) => plugin.name).join('\u0000'),
      onPointClick !== undefined,
      onHover !== undefined,
      onLegendToggle !== undefined,
      valueFormatter !== undefined,
      tooltipKey(options.tooltip),
    ],
    config
  );
}

/** Render the fallback error box inside `container`, replacing its contents. */
export function showChartError(container: HTMLElement, message: string): void {
  const box = container.ownerDocument.createElement('div');
  box.className = 'chartlite-error';
  box.setAttribute('role', 'alert');
  box.setAttribute(
    'style',
    'padding:20px;color:#dc2626;border:1px solid #fecaca;border-radius:4px;background-color:#fee2e2'
  );
  const strong = container.ownerDocument.createElement('strong');
  strong.textContent = 'Chart Error:';
  box.append(strong, ' ', message);
  container.replaceChildren(box);
}

/**
 * Owns one core chart for one container. Call {@link ChartController.sync} with
 * the current config whenever the host framework re-renders; it decides whether
 * to do nothing, `update(data)`, re-render, or recreate.
 */
export class ChartController {
  /** The live chart, or `null` before the first sync / after an error. */
  chart: ChartInstance | null = null;
  /** The last render/update error, or `null`. */
  error: Error | null = null;

  private container: HTMLElement | null = null;
  private ctor: ChartConstructor<never> | undefined = undefined;
  private structure: string | null = null;
  private dataKey: string | null = null;
  private formatterSource: string | null = null;
  private latest: LatestHandlers = {};

  private readonly proxies = {
    onPointClick: (event: ChartPointEvent): void => {
      this.latest.onPointClick?.(event);
    },
    onHover: (event: ChartPointEvent | null): void => {
      this.latest.onHover?.(event);
    },
    onLegendToggle: (event: LegendToggleEvent): void => {
      this.latest.onLegendToggle?.(event);
    },
    valueFormatter: (value: number): string =>
      this.latest.valueFormatter ? this.latest.valueFormatter(value) : String(value),
    tooltipFormatter: (event: ChartPointEvent): string =>
      this.latest.tooltipFormatter ? this.latest.tooltipFormatter(event) : `${event.x}: ${event.y}`,
  };

  /**
   * Bring the chart in line with `config`. Returns the current error (or `null`).
   * Safe to call on every host render: unchanged input is a no-op.
   */
  sync<C extends CoreConfig>(
    container: HTMLElement,
    Ctor: ChartConstructor<C> | undefined,
    config: C,
    options: BridgeOptions = {}
  ): Error | null {
    const tooltipOption = options.tooltip;
    this.latest = {
      onPointClick: config.onPointClick,
      onHover: config.onHover,
      onLegendToggle: config.onLegendToggle,
      valueFormatter: config.valueFormatter,
      tooltipFormatter:
        tooltipOption === undefined || tooltipOption === true || tooltipOption === false
          ? undefined
          : tooltipOption.formatter,
      onError: options.onError,
    };

    const structure = structureKey(config, options);
    const dataKey = stableKey(config.data, config.data);
    // Formatter output is baked into the SVG at render time. Identity changes are
    // ignored (inline arrows), but a formatter with different source re-renders.
    const formatterSource = config.valueFormatter ? String(config.valueFormatter) : '';

    const recreate =
      container !== this.container ||
      Ctor !== this.ctor ||
      structure !== this.structure ||
      // Previously failed: retry only when the input changed.
      (this.chart === null && (dataKey !== this.dataKey || formatterSource !== this.formatterSource));
    const dataChanged = dataKey !== this.dataKey;
    const formatterChanged = formatterSource !== this.formatterSource;

    this.container = container;
    this.ctor = Ctor;
    this.structure = structure;
    this.dataKey = dataKey;
    this.formatterSource = formatterSource;

    if (recreate) {
      this.build(container, Ctor, config, options);
    } else if (this.chart && dataChanged) {
      const chart = this.chart;
      this.attempt(() => chart.update(config.data));
    } else if (this.chart && formatterChanged) {
      const chart = this.chart;
      this.attempt(() => chart.render());
    }
    return this.error;
  }

  /**
   * Show `error` in the container and forget the current chart, e.g. for input
   * that failed to parse before it could reach {@link ChartController.sync}.
   */
  fail(container: HTMLElement, error: Error, options: BridgeOptions = {}): Error {
    this.latest = { onError: options.onError };
    this.container = container;
    this.ctor = undefined;
    this.structure = null;
    this.dataKey = null;
    this.formatterSource = null;
    this.teardown();
    this.report(error);
    return error;
  }

  /** Serialize the live chart. Throws if there is no rendered chart. */
  toSVG(): string {
    if (!this.chart) throw new Error('Chart must be rendered before calling toSVG()');
    return this.chart.toSVG();
  }

  /** Destroy the chart. A later `sync` rebuilds from scratch. */
  destroy(): void {
    this.teardown();
    this.container = null;
    this.ctor = undefined;
    this.structure = null;
    this.dataKey = null;
    this.formatterSource = null;
    this.error = null;
  }

  private build<C extends CoreConfig>(
    container: HTMLElement,
    Ctor: ChartConstructor<C> | undefined,
    config: C,
    options: BridgeOptions
  ): void {
    this.teardown();
    try {
      if (!Ctor) throw new Error(`Unknown chart type: ${String(options.type)}`);
      if (config.data === undefined || config.data === null) {
        throw new Error('Chart data is required');
      }
      const chart = new Ctor(container, this.coreConfig(config, options.tooltip));
      this.chart = chart;
      chart.render();
      this.error = null;
    } catch (err) {
      this.teardown();
      this.report(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private attempt(run: () => void): void {
    try {
      run();
      this.error = null;
    } catch (err) {
      this.teardown();
      this.report(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private coreConfig<C extends CoreConfig>(config: C, tooltipOption: WrapperOptions['tooltip']): C {
    // Drop `undefined` options so they fall back to core defaults instead of
    // overriding them (e.g. an unset `responsive` prop must not disable resizing).
    const defined = { ...config };
    for (const [key, value] of Object.entries(defined)) {
      if (value === undefined) Reflect.deleteProperty(defined, key);
    }
    const plugins: ChartPlugin[] = [...(config.plugins ?? [])];
    const names = new Set(plugins.map((plugin) => plugin.name));
    if (tooltipOption !== undefined && tooltipOption !== false && !names.has('tooltip')) {
      plugins.push(
        tooltip(
          tooltipOption === true
            ? {}
            : {
                ...tooltipOption,
                formatter: tooltipOption.formatter && this.proxies.tooltipFormatter,
              }
        )
      );
    }
    if ((config.onPointClick || config.onHover) && !names.has('callbacks')) {
      plugins.push(callbacks());
    }
    if (config.onLegendToggle && !names.has('legendToggle')) {
      plugins.push(legendToggle());
    }
    return {
      ...defined,
      plugins,
      onPointClick: config.onPointClick && this.proxies.onPointClick,
      onHover: config.onHover && this.proxies.onHover,
      onLegendToggle: config.onLegendToggle && this.proxies.onLegendToggle,
      valueFormatter: config.valueFormatter && this.proxies.valueFormatter,
    };
  }

  private teardown(): void {
    const chart = this.chart;
    this.chart = null;
    if (chart) {
      try {
        chart.destroy();
      } catch {
        // A chart that failed mid-render may not tear down cleanly; the
        // container is cleared below regardless.
      }
    }
    this.container?.replaceChildren();
  }

  private report(error: Error): void {
    this.error = error;
    if (this.container) showChartError(this.container, error.message);
    const onError = this.latest.onError;
    if (onError) onError(error);
    else console.error('Chartlite render error:', error);
  }
}
