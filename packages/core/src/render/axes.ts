/** Shared axis rendering for Chartlite's three Cartesian axis combinations. */

import { getThemeColors, createLinearScale, createBandScale, calculateNiceTicks } from '../utils';
import { CHART_DEFAULTS, createSVGElement } from './constants';
type ThemeColors = ReturnType<typeof getThemeColors>;
type ValueFormat = (value: number) => string;
const defaultFormat: ValueFormat = String;
const MIN_CATEGORICAL_LABEL_SPACING = CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE * 4;

/** Select evenly spaced categorical labels while retaining both endpoints. */
function selectCategoricalLabelIndices(labelCount: number, axisLength: number): number[] {
  if (labelCount <= 0) return [];

  const maxLabels = Math.max(
    2,
    Math.floor(Math.max(0, axisLength) / MIN_CATEGORICAL_LABEL_SPACING) + 1,
  );
  if (labelCount <= maxLabels) {
    return Array.from({ length: labelCount }, (_, index) => index);
  }

  return Array.from(
    { length: maxLabels },
    (_, index) => Math.round((index * (labelCount - 1)) / (maxLabels - 1)),
  );
}

function boundedTicks(min: number, max: number): number[] {
  const ticks = calculateNiceTicks(min, max, 5).filter(tick => tick >= min && tick <= max);
  if (ticks[0] !== min) ticks.unshift(min);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}

function appendLine(
  group: SVGGElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  opacity?: number
): void {
  const line = createSVGElement('line');
  line.setAttribute('x1', String(x1));
  line.setAttribute('y1', String(y1));
  line.setAttribute('x2', String(x2));
  line.setAttribute('y2', String(y2));
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '1');
  if (opacity !== undefined) line.setAttribute('opacity', String(opacity));
  group.appendChild(line);
}

function appendLabel(
  group: SVGGElement,
  x: number,
  y: number,
  value: string,
  color: string,
  anchor: 'start' | 'middle' | 'end' = 'middle',
  middle = false
): void {
  const label = createSVGElement('text');
  label.setAttribute('x', String(x));
  label.setAttribute('y', String(y));
  label.setAttribute('text-anchor', anchor);
  if (middle) label.setAttribute('dominant-baseline', 'middle');
  label.setAttribute('fill', color);
  label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
  label.textContent = value;
  group.appendChild(label);
}

function appendAxisLines(
  group: SVGGElement,
  width: number,
  height: number,
  color: string
): void {
  appendLine(group, 0, 0, 0, height, color);
  appendLine(group, 0, height, width, height, color);
}

function appendNumericY(
  group: SVGGElement,
  min: number,
  max: number,
  width: number,
  height: number,
  colors: ThemeColors,
  format: ValueFormat
): void {
  const scale = createLinearScale([min, max], [height, 0]);
  for (const tick of boundedTicks(min, max)) {
    const y = scale(tick);
    appendLine(group, 0, y, width, y, colors.grid, 0.3);
    appendLabel(group, -CHART_DEFAULTS.AXIS_LABEL_OFFSET, y, format(tick), colors.text, 'end', true);
  }
}

function appendNumericX(
  group: SVGGElement,
  min: number,
  max: number,
  width: number,
  height: number,
  colors: ThemeColors,
  format: ValueFormat
): void {
  const scale = createLinearScale([min, max], [0, width]);
  for (const tick of boundedTicks(min, max)) {
    const x = scale(tick);
    appendLine(group, x, 0, x, height, colors.grid, 0.3);
    appendLabel(
      group,
      x,
      height + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET,
      format(tick),
      colors.text
    );
  }
}

export function renderCategoricalXLinearYAxes(
  group: SVGGElement,
  xValues: string[],
  yMin: number,
  yMax: number,
  chartWidth: number,
  chartHeight: number,
  colors: ThemeColors,
  formatValue: ValueFormat = defaultFormat
): void {
  appendAxisLines(group, chartWidth, chartHeight, colors.grid);
  appendNumericY(group, yMin, yMax, chartWidth, chartHeight, colors, formatValue);
  const scale = createBandScale(xValues, [0, chartWidth], 0);
  for (const index of selectCategoricalLabelIndices(xValues.length, chartWidth)) {
    const value = xValues[index];
    appendLabel(
      group,
      scale.scale(value) + scale.bandwidth / 2,
      chartHeight + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET,
      value,
      colors.text
    );
  }
}

export function renderLinearXLinearYAxes(
  group: SVGGElement,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  chartWidth: number,
  chartHeight: number,
  colors: ThemeColors,
  formatValue: ValueFormat = defaultFormat
): void {
  appendAxisLines(group, chartWidth, chartHeight, colors.grid);
  appendNumericY(group, yMin, yMax, chartWidth, chartHeight, colors, formatValue);
  appendNumericX(group, xMin, xMax, chartWidth, chartHeight, colors, formatValue);
}

export function renderLinearXCategoricalYAxes(
  group: SVGGElement,
  yValues: string[],
  xMin: number,
  xMax: number,
  chartWidth: number,
  chartHeight: number,
  colors: ThemeColors,
  formatValue: ValueFormat = defaultFormat
): void {
  appendAxisLines(group, chartWidth, chartHeight, colors.grid);
  appendNumericX(group, xMin, xMax, chartWidth, chartHeight, colors, formatValue);
  const scale = createBandScale(yValues, [0, chartHeight], 0.2);
  for (const index of selectCategoricalLabelIndices(yValues.length, chartHeight)) {
    const value = yValues[index];
    appendLabel(
      group,
      -CHART_DEFAULTS.AXIS_LABEL_OFFSET,
      scale.scale(value) + scale.bandwidth / 2,
      value,
      colors.text,
      'end',
      true
    );
  }
}
