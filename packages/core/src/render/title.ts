/**
 * Chart title rendering. Positioned at the top of the SVG, outside the data area.
 */

import type { BaseChartConfig, Dimensions } from '../types';
import { getThemeColors } from '../utils';
import { CHART_DEFAULTS } from './constants';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function renderTitle(
  svg: SVGSVGElement,
  config: BaseChartConfig,
  dimensions: Dimensions
): void {
  const colors = getThemeColors(config.theme || 'default');

  // Position title near the top of SVG
  const titleY = CHART_DEFAULTS.TITLE_FONT_SIZE + CHART_DEFAULTS.TITLE_TOP_PADDING;

  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', String(dimensions.width / 2));
  text.setAttribute('y', String(titleY));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', colors.text);
  text.setAttribute('font-size', String(CHART_DEFAULTS.TITLE_FONT_SIZE));
  text.setAttribute('font-weight', '600');
  text.textContent = config.title || '';

  svg.appendChild(text);
}
