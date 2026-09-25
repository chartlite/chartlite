import {
  useImperativeHandle,
  type AriaAttributes,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
} from 'react';
import type { ChartConstructor, ChartInstance, CoreConfig, WrapperOptions } from './bridge';
import { useChart } from './useChart';

/** Props shared by every Chartlite React component. */
export interface ChartFrameOwnProps extends WrapperOptions {
  /** `id` of the container element. */
  id?: string;
  /** Extra class on the container element. */
  className?: string;
  /** Inline styles on the container element. */
  style?: CSSProperties;
  /** Called when the underlying chart throws while rendering or updating. */
  onError?: (error: Error) => void;
}

/** A primitive DOM attribute value. */
type AttributeValue = string | number | boolean | undefined;

/** `aria-*` and `data-*` attributes, forwarded to the container element. */
export interface ChartContainerAttributes extends AriaAttributes {
  [attribute: `aria-${string}`]: AttributeValue;
  [attribute: `data-${string}`]: AttributeValue;
}

/**
 * Imperative handle exposed through `ref` on every Chartlite React component.
 *
 * ```tsx
 * const ref = useRef<ChartHandle>(null);
 * <LineChart ref={ref} data={data} />
 * // later: download(ref.current?.toSVG())
 * ```
 */
export interface ChartHandle {
  /** The live core chart instance, or `null` before mount / after an error. */
  readonly chart: ChartInstance | null;
  /** The container `<div>` the chart renders into. */
  readonly container: HTMLDivElement | null;
  /** The current render error, or `null`. */
  readonly error: Error | null;
  /** Serialize the current chart to an SVG string. Throws if nothing is rendered. */
  toSVG(): string;
}

/** Full props for a component rendering a chart of config `C`. */
export type ChartComponentProps<C> = C & ChartFrameOwnProps & ChartContainerAttributes;

function isContainerAttribute(key: string): boolean {
  return key.startsWith('aria-') || key.startsWith('data-');
}

/**
 * Renders a container `<div>` and drives a core chart into it via {@link useChart}.
 * The container is always rendered; if the chart throws, a fallback error box is
 * shown inside it (and `onError` is called), and the chart recovers as soon as
 * valid props arrive. This is the single mount/render/cleanup path behind both
 * `<Chart>` and every named component.
 */
export function ChartFrame<C extends CoreConfig>({
  ctor,
  props,
  type,
  forwardedRef,
}: {
  ctor: ChartConstructor<C> | undefined;
  /** Component props: chart config plus wrapper/container props. */
  props: ChartComponentProps<C>;
  /** Chart type label for "unknown type" errors (generic `<Chart>` only). */
  type?: string;
  forwardedRef: ForwardedRef<ChartHandle>;
}): ReactElement {
  const { id, className, style, onError, tooltip, ...rest } = props;
  const entries = Object.entries(rest);
  const attributes = Object.fromEntries(entries.filter(([key]) => isContainerAttribute(key)));
  // SAFETY: `rest` is the chart config after removing wrapper props; dropping the
  // DOM-only `aria-*`/`data-*` keys leaves exactly the core chart options.
  const config = Object.fromEntries(entries.filter(([key]) => !isContainerAttribute(key))) as C;

  const { containerRef, controller } = useChart(ctor, config, { onError, tooltip, type });

  useImperativeHandle(
    forwardedRef,
    () => ({
      get chart() {
        return controller.chart;
      },
      get container() {
        return containerRef.current;
      },
      get error() {
        return controller.error;
      },
      toSVG: () => controller.toSVG(),
    }),
    [controller, containerRef]
  );

  // The container never has React children: the chart (or the error box) is
  // rendered into it imperatively by the controller.
  return <div {...attributes} ref={containerRef} id={id} className={className} style={style} />;
}
