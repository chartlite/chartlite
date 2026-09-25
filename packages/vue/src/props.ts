/**
 * Typed Vue prop declarations for every chart option, so templates get
 * autocomplete/type-checking (Volar) and kebab-case attributes such as
 * `:start-angle` or `:show-points="false"` are normalized by Vue itself.
 *
 * Every prop defaults to `undefined` (even booleans — Vue would otherwise cast an
 * absent boolean prop to `false`), so an omitted option falls back to the core
 * default. Boolean shorthand works: `<LineChart css-vars />` passes `true`.
 */
import type { PropType } from 'vue';
import type {
  Annotation,
  AreaChartConfig,
  BarChartConfig,
  ChartPlugin,
  ChartPointEvent,
  ComboChartConfig,
  FlexibleDataInput,
  LegendConfig,
  LegendToggleEvent,
  LineChartConfig,
  PieChartConfig,
  RadialChartConfig,
  ReferenceLine,
  Region,
  ScatterChartConfig,
  SparklineConfig,
  Theme,
} from '@chartlite/core';
import type { TooltipOptions } from '@chartlite/core/interactive';
import type { WrapperOptions } from './bridge';
import type { ChartType } from './useChart';

type RuntimeType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor
  | FunctionConstructor;

/** An optional prop: runtime-validated by `type`, typed as `T`, default `undefined`. */
interface OptionalProp<T> {
  type: PropType<T>;
  default: undefined;
}

/* @__NO_SIDE_EFFECTS__ */
function optional<T>(type: RuntimeType | RuntimeType[]): OptionalProp<T> {
  // SAFETY: Vue validates values against the runtime constructor(s); `T` is the
  // narrower TypeScript type of the same values (e.g. a Theme string union).
  return { type: type as PropType<T>, default: undefined };
}

interface DeclaredProp {
  default: undefined;
}
type WrapperKey = keyof WrapperOptions | 'onError';
/** Compile-time check: every option key of `C` (plus wrapper props) is declared. */
type PropsFor<C> = { [K in keyof Required<C> | WrapperKey]: DeclaredProp };

/** Options shared by every chart type (`BaseChartConfig` + `data` + wrapper props). */
export const baseProps = {
  data: optional<FlexibleDataInput>([Array, Object]),
  width: optional<number>(Number),
  height: optional<number>(Number),
  theme: optional<Theme>(String),
  colors: optional<string[]>(Array),
  title: optional<string>(String),
  /** Shown automatically for 2+ series; `false` hides it, an object positions it. */
  legend: optional<boolean | LegendConfig>([Boolean, Object]),
  /** Point budget before downsampling (default 500; 0 disables). */
  maxPoints: optional<number>(Number),
  animate: optional<boolean>(Boolean),
  responsive: optional<boolean>(Boolean),
  cssVars: optional<boolean>(Boolean),
  referenceLines: optional<ReferenceLine[]>(Array),
  annotations: optional<Annotation[]>(Array),
  regions: optional<Region[]>(Array),
  plugins: optional<ChartPlugin[]>(Array),
  valueFormatter: optional<(value: number) => string>(Function),
  xFormatter: optional<(value: string | number) => string>(Function),
  /** Point click. Listen with `@point-click`; adds `callbacks()` automatically. */
  onPointClick: optional<(event: ChartPointEvent) => void>(Function),
  /** Point hover (`null` on leave). Listen with `@hover`; adds `callbacks()`. */
  onHover: optional<(event: ChartPointEvent | null) => void>(Function),
  /** Legend toggle. Listen with `@legend-toggle`; adds `legendToggle()`. */
  onLegendToggle: optional<(event: LegendToggleEvent) => void>(Function),
  /** Render/update error. Listen with `@error`. */
  onError: optional<(error: Error) => void>(Function),
  /** Hover tooltip: `tooltip` / `:tooltip="true"`, or an options object. */
  tooltip: optional<boolean | TooltipOptions>([Boolean, Object]),
};

const curve = optional<'linear' | 'smooth'>(String);
const showPoints = optional<boolean>(Boolean);
const showLabels = optional<boolean>(Boolean);
const fillOpacity = optional<number>(Number);

/* @__NO_SIDE_EFFECTS__ */
export function lineProps() {
  return { ...baseProps, curve, showPoints } satisfies PropsFor<LineChartConfig>;
}

/* @__NO_SIDE_EFFECTS__ */
export function barProps() {
  return {
    ...baseProps,
    orientation: optional<BarChartConfig['orientation']>(String),
    stacked: optional<boolean>(Boolean),
  } satisfies PropsFor<BarChartConfig>;
}

/* @__NO_SIDE_EFFECTS__ */
export function areaProps() {
  return {
    ...baseProps,
    curve,
    fillOpacity,
    gradient: optional<boolean>(Boolean),
  } satisfies PropsFor<AreaChartConfig>;
}

/* @__NO_SIDE_EFFECTS__ */
export function scatterProps() {
  return {
    ...baseProps,
    pointSize: optional<number>(Number),
    showLabels,
    labelOffset: optional<number>(Number),
    labelPosition: optional<ScatterChartConfig['labelPosition']>(String),
    pointShape: optional<ScatterChartConfig['pointShape']>(String),
  } satisfies PropsFor<ScatterChartConfig>;
}

/* @__NO_SIDE_EFFECTS__ */
export function pieProps() {
  return {
    ...baseProps,
    innerRadius: optional<number>(Number),
    showLabels,
  } satisfies PropsFor<PieChartConfig>;
}

/* @__NO_SIDE_EFFECTS__ */
export function radialProps() {
  return {
    ...baseProps,
    max: optional<number>(Number),
    startAngle: optional<number>(Number),
    endAngle: optional<number>(Number),
    thickness: optional<number>(Number),
    showValue: optional<boolean>(Boolean),
    trackColor: optional<string>(String),
  } satisfies PropsFor<RadialChartConfig>;
}

/* @__NO_SIDE_EFFECTS__ */
export function comboProps() {
  return {
    ...baseProps,
    defaultType: optional<ComboChartConfig['defaultType']>(String),
    curve,
    showPoints,
    fillOpacity,
  } satisfies PropsFor<ComboChartConfig>;
}

const sparklineOnlyProps = {
  curve,
  showEndDot: optional<boolean>(Boolean),
  strokeWidth: optional<number>(Number),
  fillOpacity,
  /** Sparkline shape: `'line'` or `'area'` (alias of `type`). */
  variant: optional<SparklineConfig['variant']>(String),
};

/* @__NO_SIDE_EFFECTS__ */
export function sparklineProps() {
  return {
    ...baseProps,
    ...sparklineOnlyProps,
    /** Sparkline style. */
    type: optional<SparklineConfig['type']>(String),
  } satisfies PropsFor<SparklineConfig>;
}

/** The generic `<Chart>`: every option of every chart type, plus the chart `type`. */
/* @__NO_SIDE_EFFECTS__ */
export function genericProps() {
  return {
    ...lineProps(),
    ...barProps(),
    ...areaProps(),
    ...scatterProps(),
    ...pieProps(),
    ...radialProps(),
    ...comboProps(),
    ...sparklineOnlyProps,
    /** Which chart to render. */
    type: optional<ChartType>(String),
    };
  }
