/**
 * Legend rendering for multi-series charts. Laid out horizontally in the expanded
 * margin area (above or below the data area), measured with getBBox where available.
 */

import type { BaseChartConfig, Dimensions, SeriesData } from '../types';
import { getThemeColors, getDefaultDimensions } from '../utils';
import { CHART_DEFAULTS, createGroup } from './constants';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function renderLegend(
  svg: SVGSVGElement,
  config: BaseChartConfig,
  dimensions: Dimensions,
  seriesData: SeriesData[]
): void {
  const colors = getThemeColors(config.theme || 'default');
  const position = config.legend?.position || 'top';

  // Create legend group
  const legendGroup = createGroup();
  legendGroup.classList.add('chart-legend');

  // Calculate legend item dimensions
  const itemSpacing = CHART_DEFAULTS.LEGEND_ITEM_SPACING;
  const iconSize = CHART_DEFAULTS.LEGEND_ICON_SIZE;
  const iconMargin = CHART_DEFAULTS.LEGEND_ICON_MARGIN;

  // Render horizontal legend (only layout supported)
  let currentX = 0;
  const itemWidths: number[] = [];

  // First pass: render items and measure their actual widths
  seriesData.forEach((series, seriesIndex) => {
    const itemGroup = createGroup(currentX, 0);
    // Tag each item so the tree-shakeable legendToggle() plugin can bind clicks
    // and match the item to its series. Purely additive; no effect when unused.
    itemGroup.classList.add('legend-item');
    itemGroup.setAttribute('data-series-index', String(seriesIndex));
    itemGroup.setAttribute('data-series', series.name);

    // Color indicator (square)
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', String(iconSize));
    rect.setAttribute('height', String(iconSize));
    rect.setAttribute('fill', series.color || colors.primary);
    rect.setAttribute('rx', '2');
    itemGroup.appendChild(rect);

    // Label
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(iconSize + iconMargin));
    label.setAttribute('y', String(iconSize / 2));
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', colors.text);
    label.setAttribute('font-size', String(CHART_DEFAULTS.LEGEND_FONT_SIZE));
    label.textContent = series.name;
    itemGroup.appendChild(label);

    legendGroup.appendChild(itemGroup);

    // Measure actual text width using getBBox()
    // Temporarily append to SVG to measure
    svg.appendChild(legendGroup);
    let textWidth: number;
    try {
      const bbox = label.getBBox();
      textWidth = bbox.width;
    } catch (e) {
      // getBBox not available (e.g., in test environment or SSR)
      // Fallback to estimation: ~7px per character
      textWidth = series.name.length * 7;
    }
    const itemWidth = iconSize + iconMargin + textWidth;
    itemWidths.push(itemWidth);
    svg.removeChild(legendGroup);

    currentX += itemWidth + itemSpacing;
  });

  // Calculate total width
  const totalWidth =
    itemWidths.reduce((sum, w) => sum + w, 0) + itemSpacing * (seriesData.length - 1);

  // Calculate horizontal position based on alignment
  const align = config.legend?.align || 'left';
  const chartWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;

  let legendX: number;
  if (align === 'center') {
    legendX = dimensions.margin.left + (chartWidth - totalWidth) / 2;
  } else if (align === 'right') {
    legendX = dimensions.margin.left + chartWidth - totalWidth;
  } else {
    legendX = dimensions.margin.left;
  }

  // Position legend in the expanded margin area (outside data area)
  if (position === 'top') {
    let legendY: number;

    if (config.title) {
      // Title is present - position legend below title
      const titleY = CHART_DEFAULTS.TITLE_FONT_SIZE + CHART_DEFAULTS.TITLE_TOP_PADDING;
      legendY = titleY + CHART_DEFAULTS.TITLE_BOTTOM_PADDING;
    } else {
      // No title - position legend near top of SVG
      legendY = CHART_DEFAULTS.LEGEND_FONT_SIZE + CHART_DEFAULTS.TITLE_TOP_PADDING;
    }

    legendGroup.setAttribute('transform', `translate(${legendX}, ${legendY})`);
  } else {
    // Position legend in the bottom margin area
    const baseDims = getDefaultDimensions(dimensions.width, CHART_DEFAULTS.DEFAULT_HEIGHT);
    const dataAreaBottom =
      dimensions.height - dimensions.margin.bottom + baseDims.margin.bottom;
    const legendY = dataAreaBottom + CHART_DEFAULTS.LEGEND_FONT_SIZE;
    legendGroup.setAttribute('transform', `translate(${legendX}, ${legendY})`);
  }

  svg.appendChild(legendGroup);
}
