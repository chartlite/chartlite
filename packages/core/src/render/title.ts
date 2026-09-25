/**
 * Chart title rendering. Left-aligned at the top of the SVG, outside the data
 * area, so it lines up with the legend and the widest axis label.
 */

import type { BaseChartConfig } from '../types';
import type { getThemeColors } from '../utils';
import { CHART_DEFAULTS, svgEl } from './constants';

export function renderTitle(
  svg: SVGSVGElement,
  config: BaseChartConfig,
  colors: ReturnType<typeof getThemeColors>
): void {
  svgEl('text', {
    class: 'chart-title',
    x: CHART_DEFAULTS.PADDING,
    y: CHART_DEFAULTS.PADDING + 13,
    fill: colors.text,
    'font-size': CHART_DEFAULTS.TITLE_FONT_SIZE,
    'font-weight': 600,
  }, svg).textContent = config.title || '';
}
