/**
 * Axis rendering for the three axis-type combinations Chartlite supports:
 * categorical-X/linear-Y (line/bar/area), linear-X/linear-Y (scatter), and
 * linear-X/categorical-Y (horizontal bar). Each draws axis lines, gridlines,
 * ticks, and labels into the provided data-area `<g>`.
 */

import { getThemeColors, createLinearScale, createBandScale, calculateNiceTicks } from '../utils';
import { CHART_DEFAULTS } from './constants';

const SVG_NS = 'http://www.w3.org/2000/svg';

type ThemeColors = ReturnType<typeof getThemeColors>;
type ValueFormat = (value: number) => string;

const defaultFormat: ValueFormat = (v) => String(v);

/** Categorical X-axis with linear Y-axis (LineChart, BarChart, AreaChart). */
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
  // Y-axis line
  const yAxis = document.createElementNS(SVG_NS, 'line');
  yAxis.setAttribute('x1', '0');
  yAxis.setAttribute('y1', '0');
  yAxis.setAttribute('x2', '0');
  yAxis.setAttribute('y2', String(chartHeight));
  yAxis.setAttribute('stroke', colors.grid);
  yAxis.setAttribute('stroke-width', '1');
  group.appendChild(yAxis);

  // X-axis line
  const xAxis = document.createElementNS(SVG_NS, 'line');
  xAxis.setAttribute('x1', '0');
  xAxis.setAttribute('y1', String(chartHeight));
  xAxis.setAttribute('x2', String(chartWidth));
  xAxis.setAttribute('y2', String(chartHeight));
  xAxis.setAttribute('stroke', colors.grid);
  xAxis.setAttribute('stroke-width', '1');
  group.appendChild(xAxis);

  // Y-axis labels and grid lines
  const yTicks = calculateNiceTicks(yMin, yMax, 5);
  const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

  yTicks.forEach((tick) => {
    const y = yScale(tick);

    // Grid line
    const gridLine = document.createElementNS(SVG_NS, 'line');
    gridLine.setAttribute('x1', '0');
    gridLine.setAttribute('y1', String(y));
    gridLine.setAttribute('x2', String(chartWidth));
    gridLine.setAttribute('y2', String(y));
    gridLine.setAttribute('stroke', colors.grid);
    gridLine.setAttribute('stroke-width', '1');
    gridLine.setAttribute('opacity', '0.3');
    group.appendChild(gridLine);

    // Label
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(-CHART_DEFAULTS.AXIS_LABEL_OFFSET));
    label.setAttribute('y', String(y));
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', colors.text);
    label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
    label.textContent = formatValue(tick);
    group.appendChild(label);
  });

  // X-axis labels
  const xScale = createBandScale(xValues, [0, chartWidth], 0);
  xValues.forEach((value) => {
    const x = xScale.scale(value) + xScale.bandwidth / 2;
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(x));
    label.setAttribute('y', String(chartHeight + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', colors.text);
    label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
    label.textContent = value;
    group.appendChild(label);
  });
}

/** Linear X-axis with linear Y-axis (ScatterChart). */
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
  // Y-axis line
  const yAxis = document.createElementNS(SVG_NS, 'line');
  yAxis.setAttribute('x1', '0');
  yAxis.setAttribute('y1', '0');
  yAxis.setAttribute('x2', '0');
  yAxis.setAttribute('y2', String(chartHeight));
  yAxis.setAttribute('stroke', colors.grid);
  yAxis.setAttribute('stroke-width', '1');
  group.appendChild(yAxis);

  // X-axis line
  const xAxis = document.createElementNS(SVG_NS, 'line');
  xAxis.setAttribute('x1', '0');
  xAxis.setAttribute('y1', String(chartHeight));
  xAxis.setAttribute('x2', String(chartWidth));
  xAxis.setAttribute('y2', String(chartHeight));
  xAxis.setAttribute('stroke', colors.grid);
  xAxis.setAttribute('stroke-width', '1');
  group.appendChild(xAxis);

  // Y-axis labels and grid lines
  const yTicks = calculateNiceTicks(yMin, yMax, 5);
  const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

  yTicks.forEach((tick) => {
    const y = yScale(tick);

    // Grid line
    const gridLine = document.createElementNS(SVG_NS, 'line');
    gridLine.setAttribute('x1', '0');
    gridLine.setAttribute('y1', String(y));
    gridLine.setAttribute('x2', String(chartWidth));
    gridLine.setAttribute('y2', String(y));
    gridLine.setAttribute('stroke', colors.grid);
    gridLine.setAttribute('stroke-width', '1');
    gridLine.setAttribute('opacity', '0.3');
    group.appendChild(gridLine);

    // Label
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(-CHART_DEFAULTS.AXIS_LABEL_OFFSET));
    label.setAttribute('y', String(y));
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', colors.text);
    label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
    label.textContent = formatValue(tick);
    group.appendChild(label);
  });

  // X-axis labels and grid lines
  const xTicks = calculateNiceTicks(xMin, xMax, 5);
  const xScale = createLinearScale([xMin, xMax], [0, chartWidth]);

  xTicks.forEach((tick) => {
    const x = xScale(tick);

    // Grid line (vertical)
    const gridLine = document.createElementNS(SVG_NS, 'line');
    gridLine.setAttribute('x1', String(x));
    gridLine.setAttribute('y1', '0');
    gridLine.setAttribute('x2', String(x));
    gridLine.setAttribute('y2', String(chartHeight));
    gridLine.setAttribute('stroke', colors.grid);
    gridLine.setAttribute('stroke-width', '1');
    gridLine.setAttribute('opacity', '0.3');
    group.appendChild(gridLine);

    // Label
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(x));
    label.setAttribute('y', String(chartHeight + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', colors.text);
    label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
    label.textContent = formatValue(tick);
    group.appendChild(label);
  });
}

/** Linear X-axis with categorical Y-axis (horizontal BarChart). */
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
  // Y-axis line
  const yAxis = document.createElementNS(SVG_NS, 'line');
  yAxis.setAttribute('x1', '0');
  yAxis.setAttribute('y1', '0');
  yAxis.setAttribute('x2', '0');
  yAxis.setAttribute('y2', String(chartHeight));
  yAxis.setAttribute('stroke', colors.grid);
  yAxis.setAttribute('stroke-width', '1');
  group.appendChild(yAxis);

  // X-axis line
  const xAxis = document.createElementNS(SVG_NS, 'line');
  xAxis.setAttribute('x1', '0');
  xAxis.setAttribute('y1', String(chartHeight));
  xAxis.setAttribute('x2', String(chartWidth));
  xAxis.setAttribute('y2', String(chartHeight));
  xAxis.setAttribute('stroke', colors.grid);
  xAxis.setAttribute('stroke-width', '1');
  group.appendChild(xAxis);

  // X-axis labels and grid lines
  const xTicks = calculateNiceTicks(xMin, xMax, 5);
  const xScale = createLinearScale([xMin, xMax], [0, chartWidth]);

  xTicks.forEach((tick) => {
    const x = xScale(tick);

    // Grid line
    const gridLine = document.createElementNS(SVG_NS, 'line');
    gridLine.setAttribute('x1', String(x));
    gridLine.setAttribute('y1', '0');
    gridLine.setAttribute('x2', String(x));
    gridLine.setAttribute('y2', String(chartHeight));
    gridLine.setAttribute('stroke', colors.grid);
    gridLine.setAttribute('stroke-width', '1');
    gridLine.setAttribute('opacity', '0.3');
    group.appendChild(gridLine);

    // Label
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(x));
    label.setAttribute('y', String(chartHeight + CHART_DEFAULTS.AXIS_LABEL_BOTTOM_OFFSET));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', colors.text);
    label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
    label.textContent = formatValue(tick);
    group.appendChild(label);
  });

  // Y-axis labels
  const yScale = createBandScale(yValues, [0, chartHeight], 0.2);
  yValues.forEach((value) => {
    const y = yScale.scale(value) + yScale.bandwidth / 2;
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(-CHART_DEFAULTS.AXIS_LABEL_OFFSET));
    label.setAttribute('y', String(y));
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', colors.text);
    label.setAttribute('font-size', String(CHART_DEFAULTS.AXIS_LABEL_FONT_SIZE));
    label.textContent = value;
    group.appendChild(label);
  });
}
