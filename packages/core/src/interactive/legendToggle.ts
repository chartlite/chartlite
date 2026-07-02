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
      const main = svg.querySelector('g.chart-main');

      const apply = (idx: number): void => {
        const isHidden = hidden.has(idx);
        main?.querySelectorAll(`[data-series-index="${idx}"]`).forEach((el) => {
          (el as SVGElement).style.display = isHidden ? 'none' : '';
        });
        const item = svg.querySelector(
          `.legend-item[data-series-index="${idx}"]`
        ) as SVGElement | null;
        if (item) item.style.opacity = isHidden ? '0.4' : '1';
      };

      // Re-apply persisted visibility after this (re-)render.
      hidden.forEach((idx) => apply(idx));

      svg.querySelectorAll('.legend-item').forEach((item) => {
        const idxAttr = item.getAttribute('data-series-index');
        if (idxAttr === null) return;
        const idx = Number(idxAttr);
        (item as SVGElement).style.cursor = 'pointer';
        item.addEventListener('click', () => {
          if (hidden.has(idx)) hidden.delete(idx);
          else hidden.add(idx);
          apply(idx);
          ctx.config.onLegendToggle?.({
            seriesName: item.getAttribute('data-series') ?? '',
            seriesIndex: idx,
            hidden: hidden.has(idx),
          });
        });
      });
    },
  };
}
