/**
 * Click-to-toggle legend plugin. Clicking a legend item shows/hides that series
 * by toggling the `display` of every element inside the plot area that carries a
 * matching `data-series-index`, and dims the legend item. Fires the chart's
 * `onLegendToggle` callback if present.
 *
 * Hidden state is kept across re-renders (e.g. responsive resize) so a series a
 * user hid stays hidden.
 *
 * ```ts
 * import { legendToggle } from '@chartlite/core/interactive';
 * new BarChart(el, { data, legend: { show: true }, plugins: [legendToggle()] }).render();
 * ```
 */

import type { ChartPlugin, PluginContext } from '../types';

export function legendToggle(): ChartPlugin {
  const hidden = new Set<number>();

  return {
    name: 'legendToggle',
    afterRender(ctx: PluginContext): void {
      if (!ctx.svg) return;
      const svg = ctx.svg;
      const main = svg.querySelector<SVGGElement>('g.chart-main');

      const apply = (idx: number): void => {
        const isHidden = hidden.has(idx);
        main?.querySelectorAll<SVGElement>(`[data-series-index="${idx}"]`).forEach((el) => {
          el.style.display = isHidden ? 'none' : '';
        });
        const item = svg.querySelector<SVGElement>(
          `.legend-item[data-series-index="${idx}"]`
        );
        if (item) {
          item.style.opacity = isHidden ? '0.4' : '1';
          item.setAttribute('aria-pressed', String(isHidden));
        }
      };

      // Re-apply persisted visibility after this (re-)render.
      hidden.forEach((idx) => apply(idx));

      svg.querySelectorAll<SVGElement>('.legend-item').forEach((item) => {
        const idxAttr = item.getAttribute('data-series-index');
        if (idxAttr === null) return;
        const idx = Number(idxAttr);
        item.style.cursor = 'pointer';
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-pressed', String(hidden.has(idx)));
        item.setAttribute('aria-label', `Toggle ${item.getAttribute('data-series') ?? ''} series`);
        const toggle = (): void => {
          if (hidden.has(idx)) hidden.delete(idx);
          else hidden.add(idx);
          apply(idx);
          ctx.config.onLegendToggle?.({
            seriesName: item.getAttribute('data-series') ?? '',
            seriesIndex: idx,
            hidden: hidden.has(idx),
          });
        };
        item.addEventListener('click', toggle);
        item.addEventListener('keydown', (event) => {
          if (!(event instanceof KeyboardEvent)) return;
          const keyboardEvent = event;
          if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') return;
          keyboardEvent.preventDefault();
          toggle();
        });
      });
    },
  };
}
