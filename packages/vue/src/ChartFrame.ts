import { camelize, h, type ExtractPropTypes, type RenderFunction, type SetupContext } from 'vue';
import type { ChartConstructor, ChartInstance, CoreConfig } from './bridge';
import type { genericProps } from './props';
import { useChart } from './useChart';

/** The union of every chart component's props (`type` is a plain string here). */
export type AnyChartProps = Readonly<
  Partial<Omit<ExtractPropTypes<ReturnType<typeof genericProps>>, 'type'>> & { type?: string }
>;

/**
 * What a Chartlite component exposes to a template ref:
 *
 * ```vue
 * <script setup lang="ts">
 * const chartRef = ref<ChartExposed | null>(null);
 * const svg = () => chartRef.value?.toSVG();
 * </script>
 * <LineChart ref="chartRef" :data="data" />
 * ```
 */
export interface ChartExposed {
  /** The live core chart instance, or `null` before mount / after an error. */
  readonly chart: ChartInstance | null;
  /** The current render/update error, or `null`. */
  readonly error: Error | null;
  /** The container `<div>` the chart renders into. */
  readonly container: HTMLElement | null;
  /** Serialize the current chart to an SVG string. Throws if nothing is rendered. */
  toSVG(): string;
}

/** Attribute names that belong on the container `<div>`, not in the chart config. */
function isContainerAttribute(key: string): boolean {
  return (
    key === 'class' ||
    key === 'style' ||
    key === 'id' ||
    key.startsWith('aria-') ||
    key.startsWith('data-')
  );
}

/** Undeclared `on*` listeners (e.g. `@click`) are bound on the container. */
function isListenerKey(key: string): boolean {
  return /^on[A-Z]/.test(key);
}

/**
 * Setup shared by every Chartlite Vue component.
 *
 * Chart options are declared as typed props (see `props.ts`), so templates get
 * autocomplete and Vue normalizes `kebab-case` names and boolean shorthand. Any
 * other attribute is still forwarded: `class`, `style`, `id`, `aria-*`, `data-*`
 * and undeclared listeners go to the container `<div>`; everything else is
 * camelized (`start-angle` → `startAngle`, a bare boolean attribute `''` →
 * `true`) and passed to the chart as config.
 *
 * With `typeSelectsChart` (the generic `<Chart>`), the `type` prop picks the
 * constructor; otherwise `type` is chart config (Sparkline's `line` / `area`).
 *
 * The component exposes `{ chart, error, container, toSVG() }` to template refs.
 */
/* @__NO_SIDE_EFFECTS__ */
export function chartSetup(
  resolveCtor: (type: string | undefined) => ChartConstructor<CoreConfig> | undefined,
  typeSelectsChart = false
) {
  return function setup(props: AnyChartProps, { attrs, expose }: SetupContext): RenderFunction {
    const { container, chart, error, controller } = useChart(() => {
      const { tooltip, onError, type, ...options } = props;
      const extra = Object.fromEntries(
        Object.entries(attrs)
          .filter(([key, value]) => !isContainerAttribute(key) && !(isListenerKey(key) && value instanceof Function))
          // A bare boolean attribute (`<LineChart some-flag>`) arrives as ''.
          .map(([key, value]) => [camelize(key), value === '' ? true : value])
      );
      return {
        Ctor: resolveCtor(typeSelectsChart ? type : undefined),
        // SAFETY: declared props are typed chart options; the remaining
        // fall-through attrs are forwarded as-is and validated by the core chart
        // (a missing `data` is reported by the controller).
        config: { ...options, type: typeSelectsChart ? undefined : type, ...extra } as CoreConfig,
        options: { tooltip, onError, type },
      };
    });

    expose({
      chart,
      error,
      container,
      toSVG: (): string => controller.toSVG(),
    });

    // The container never has vnode children: the chart (or the error box) is
    // rendered into it imperatively by the controller.
    return () =>
      h('div', {
        ...Object.fromEntries(
          Object.entries(attrs).filter(
            ([key, value]) => isContainerAttribute(key) || (isListenerKey(key) && value instanceof Function)
          )
        ),
        ref: container,
      });
  };
}
