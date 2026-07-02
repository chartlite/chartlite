import { defineComponent, h, type PropType } from 'vue';
import { useChart, type ChartConstructor } from './useChart';

/**
 * Internal factory: builds a Vue component bound to a core chart class. All
 * config is passed as fall-through attributes (`inheritAttrs: false`), so usage
 * mirrors the React wrapper — `<LineChart :data="data" theme="midnight" />` — with
 * `class`/`style` applied to the container and `onError` handled specially.
 *
 * `resolveCtor` receives the current attrs so the generic `<Chart>` can pick a
 * constructor from its `type` attr; named components ignore the argument.
 */
export function defineChartComponent(
  name: string,
  resolveCtor: (attrs: Record<string, unknown>) => ChartConstructor | undefined
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      onError: {
        type: Function as PropType<(error: Error) => void>,
        default: undefined,
      },
    },
    setup(props, { attrs }) {
      const getConfig = (): Record<string, unknown> => {
        // Everything except container-level attrs becomes chart config.
        const { class: _class, style: _style, type: _type, ...config } = attrs as Record<
          string,
          unknown
        >;
        return config;
      };

      const { container, error } = useChart(
        () => resolveCtor(attrs as Record<string, unknown>),
        getConfig,
        props.onError
      );

      return () => {
        if (error.value) {
          return h(
            'div',
            {
              class: attrs.class,
              style: {
                ...(attrs.style as object),
                padding: '20px',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                backgroundColor: '#fee2e2',
              },
            },
            [h('strong', 'Chart Error: '), error.value.message]
          );
        }
        return h('div', { ref: container, class: attrs.class, style: attrs.style });
      };
    },
  });
}
