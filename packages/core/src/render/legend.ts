/**
 * Legend rendering. Item widths are estimated from the label length rather than
 * measured with getBBox, so legends never force a synchronous layout and render
 * identically in the browser and during server-side rendering. Items wrap onto
 * extra rows instead of running off the canvas.
 */

import type { BaseChartConfig, Dimensions, LegendConfig } from '../types';
import type { getThemeColors } from '../utils';
import { CHART_DEFAULTS, createGroup, svgEl, textWidth } from './constants';

export interface LegendItem {
  name: string;
  color: string;
}

const { LEGEND_ICON_SIZE: ICON, LEGEND_ICON_MARGIN, LEGEND_ITEM_SPACING: SPACING, LEGEND_ROW_HEIGHT: ROW } =
  CHART_DEFAULTS;

const itemWidth = (item: LegendItem): number => ICON + LEGEND_ICON_MARGIN + textWidth(item.name);

const isLegendConfig = (legend: BaseChartConfig['legend']): legend is LegendConfig =>
  typeof legend === 'object';

/** The legend options object, whether `legend` was given as a boolean or an object. */
export const legendOptions = (config: BaseChartConfig): LegendConfig =>
  isLegendConfig(config.legend) ? config.legend : {};

/** Split items into rows no wider than `maxWidth` (one item per row when vertical). */
export function legendRows(items: LegendItem[], maxWidth: number, vertical: boolean): number[][] {
  const rows: number[][] = [];
  let used = Infinity;
  items.forEach((item, index) => {
    const width = itemWidth(item);
    if (vertical || used + SPACING + width > maxWidth) {
      rows.push([index]);
      used = width;
    } else {
      rows[rows.length - 1].push(index);
      used += SPACING + width;
    }
  });
  return rows;
}

export function renderLegend(
  svg: SVGSVGElement,
  config: BaseChartConfig,
  dimensions: Dimensions,
  items: LegendItem[],
  colors: ReturnType<typeof getThemeColors>,
  top: number
): void {
  const { PADDING } = CHART_DEFAULTS;
  const options = legendOptions(config);
  const vertical = options.layout === 'vertical';
  const rows = legendRows(items, dimensions.width - 2 * PADDING, vertical);
  const y = options.position === 'bottom' ? dimensions.height - rows.length * ROW - 4 : top;

  const legendGroup = createGroup(0, y);
  legendGroup.classList.add('chart-legend');
  const blockWidth = vertical ? Math.max(...items.map(itemWidth)) : 0;

  rows.forEach((row, rowIndex) => {
    const rowWidth = blockWidth ||
      row.reduce((sum, index) => sum + itemWidth(items[index]), 0) + SPACING * (row.length - 1);
    let x = options.align === 'center'
      ? (dimensions.width - rowWidth) / 2
      : options.align === 'right'
        ? dimensions.width - PADDING - rowWidth
        : PADDING;

    row.forEach((index) => {
      const item = items[index];
      // Tag each item so the tree-shakeable legendToggle() plugin can bind clicks
      // and match the item to its series. Purely additive; no effect when unused.
      const itemGroup = createGroup(x, rowIndex * ROW);
      itemGroup.classList.add('legend-item');
      itemGroup.setAttribute('data-series-index', String(index));
      itemGroup.setAttribute('data-series', item.name);
      svgEl('circle', { cx: ICON / 2, cy: ROW / 2, r: ICON / 2, fill: item.color }, itemGroup);
      svgEl('text', {
        x: ICON + LEGEND_ICON_MARGIN,
        y: ROW / 2,
        dy: '.32em',
        fill: colors.text,
        'font-size': CHART_DEFAULTS.LEGEND_FONT_SIZE,
      }, itemGroup).textContent = item.name;
      legendGroup.appendChild(itemGroup);
      x += itemWidth(item) + SPACING;
    });
  });

  svg.appendChild(legendGroup);
}
