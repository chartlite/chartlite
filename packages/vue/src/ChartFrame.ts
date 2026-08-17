import { defineComponent, h, type PropType, type StyleValue } from 'vue';
import {
  useChart,
  type ChartConfig,
  type ChartConstructor,
  type ChartType,
} from './useChart';

type ChartAttrs<C extends ChartConfig> = C & {
  type?: ChartType;
  class?: string;
  style?: StyleValue;
};

/**
 * Internal factory: builds a Vue component bound to a core chart class. All
 * config is passed as fall-through attributes (`inheritAttrs: false`), so usage
 * mirrors the React wrapper — `<LineChart :data="data" theme="midnight" />` — with
 * `class`/`style` applied to the container and `onError` handled specially.
 *
 * `resolveCtor` receives the current attrs so the generic `<Chart>` can pick a
 * constructor from its `type` attr; named components ignore the argument.
 */
/* @__NO_SIDE_EFFECTS__ */
export function defineChartComponent<C extends ChartConfig>(
  name: string,
  resolveCtor: (attrs: ChartAttrs<C>) => ChartConstructor<C> | undefined
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      onError: {
        // SAFETY: Vue's runtime validator is the Function constructor; PropType
        // supplies the callback signature that the wrapper invokes.
        type: Function as PropType<(error: Error) => void>,
        default: undefined,
      },
    },
    setup(props, { attrs }) {
      // SAFETY: Vue fall-through attrs are the public chart config at this boundary;
      // core constructors validate the required data and option values before render.
      const chartAttrs = attrs as ChartAttrs<C>;
      const getConfig = (): C => {
        const config = { ...chartAttrs };
        delete config.class;
        delete config.style;
        delete config.type;
        return config;
      };

      const { container, error } = useChart(
        () => resolveCtor(chartAttrs),
        getConfig,
        () => props.onError
      );

      return () => {
        if (error.value) {
          return h(
            'div',
            {
              class: chartAttrs.class,
              style: [
                chartAttrs.style,
                {
                  padding: '20px',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  backgroundColor: '#fee2e2',
                },
              ],
            },
            [h('strong', 'Chart Error: '), error.value.message]
          );
        }
        return h('div', { ref: container, class: chartAttrs.class, style: chartAttrs.style });
      };
    },
  });
}
