/**
 * Chart overlays: reference lines, annotations, and region highlighting.
 *
 * All three map data values to pixel space using the chart's bounds and the shared
 * linear/band scales, then draw into a dedicated `<g>` layered relative to the data.
 */

import type { BaseChartConfig, Dimensions } from '../types';
import { getThemeColors, createLinearScale, createBandScale } from '../utils';
import { createGroup } from './constants';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Data-space extent of the plotted area, plus optional categorical x values. */
export interface ChartBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xValues?: string[];
}

export function renderReferenceLines(
  svg: SVGSVGElement,
  config: BaseChartConfig,
  dimensions: Dimensions,
  bounds: ChartBounds
): void {
  const referenceLines = config.referenceLines;
  if (!referenceLines) return;

  const colors = getThemeColors(config.theme || 'default');
  const { margin } = dimensions;
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  // Create a group for reference lines
  const refLinesGroup = createGroup(margin.left, margin.top);
  refLinesGroup.classList.add('chart-reference-lines');

  referenceLines.forEach((refLine) => {
    const {
      axis,
      value,
      label,
      color = colors.grid,
      style = 'dashed',
      strokeWidth = 2,
      labelPosition = 'end',
    } = refLine;

    let x1: number, y1: number, x2: number, y2: number;
    let labelX: number = 0;
    let labelY: number = 0;
    let textAnchor: 'start' | 'middle' | 'end' = 'start';

    if (axis === 'y') {
      // Horizontal reference line
      const yScale = createLinearScale([bounds.yMin, bounds.yMax], [chartHeight, 0]);
      const y = yScale(value as number);

      x1 = 0;
      y1 = y;
      x2 = chartWidth;
      y2 = y;

      // Label positioning
      if (labelPosition === 'start') {
        labelX = 5;
        labelY = y - 5;
        textAnchor = 'start';
      } else if (labelPosition === 'middle') {
        labelX = chartWidth / 2;
        labelY = y - 5;
        textAnchor = 'middle';
      } else {
        labelX = chartWidth - 5;
        labelY = y - 5;
        textAnchor = 'end';
      }
    } else {
      // Vertical reference line
      let x: number;
      if (bounds.xValues) {
        // Categorical x-axis
        const xScale = createBandScale(bounds.xValues, [0, chartWidth], 0);
        x = xScale.scale(String(value)) + xScale.bandwidth / 2;
      } else {
        // Numeric x-axis
        const xScale = createLinearScale([bounds.xMin, bounds.xMax], [0, chartWidth]);
        x = xScale(value as number);
      }

      x1 = x;
      y1 = 0;
      x2 = x;
      y2 = chartHeight;

      // Label positioning
      if (labelPosition === 'start') {
        labelX = x + 5;
        labelY = 15;
        textAnchor = 'start';
      } else if (labelPosition === 'middle') {
        labelX = x + 5;
        labelY = chartHeight / 2;
        textAnchor = 'start';
      } else {
        labelX = x + 5;
        labelY = chartHeight - 5;
        textAnchor = 'start';
      }
    }

    // Draw the line
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', String(strokeWidth));

    // Apply line style
    if (style === 'dashed') {
      line.setAttribute('stroke-dasharray', '8 4');
    } else if (style === 'dotted') {
      line.setAttribute('stroke-dasharray', '2 2');
    }

    refLinesGroup.appendChild(line);

    // Add label if provided
    if (label) {
      const labelText = document.createElementNS(SVG_NS, 'text');
      labelText.setAttribute('x', String(labelX));
      labelText.setAttribute('y', String(labelY));
      labelText.setAttribute('text-anchor', textAnchor);
      labelText.setAttribute('fill', color);
      labelText.setAttribute('font-size', '11');
      labelText.setAttribute('font-weight', '500');
      labelText.textContent = label;
      refLinesGroup.appendChild(labelText);
    }
  });

  svg.appendChild(refLinesGroup);
}

export function renderAnnotations(
  svg: SVGSVGElement,
  config: BaseChartConfig,
  dimensions: Dimensions,
  bounds: ChartBounds
): void {
  const annotations = config.annotations;
  if (!annotations) return;

  const colors = getThemeColors(config.theme || 'default');
  const { margin } = dimensions;
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  // Create a group for annotations
  const annotationsGroup = createGroup(margin.left, margin.top);
  annotationsGroup.classList.add('chart-annotations');

  annotations.forEach((annotation) => {
    const {
      x: xValue,
      y: yValue,
      text,
      color = colors.text,
      fontSize = 12,
      fontWeight = 'normal',
      showArrow = false,
      arrowColor = color,
      offset = {},
      anchor = 'top',
    } = annotation;

    // Calculate point position
    let pointX: number;
    if (bounds.xValues) {
      const xScale = createBandScale(bounds.xValues, [0, chartWidth], 0);
      pointX = xScale.scale(String(xValue)) + xScale.bandwidth / 2;
    } else {
      const xScale = createLinearScale([bounds.xMin, bounds.xMax], [0, chartWidth]);
      pointX = xScale(xValue as number);
    }

    const yScale = createLinearScale([bounds.yMin, bounds.yMax], [chartHeight, 0]);
    const pointY = yScale(yValue);

    // Calculate text position based on anchor
    let textX = pointX + (offset.x || 0);
    let textY = pointY + (offset.y || 0);
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    let dominantBaseline: 'auto' | 'middle' | 'hanging' = 'middle';

    const defaultOffset = 15;

    switch (anchor) {
      case 'top':
        textY -= defaultOffset;
        textAnchor = 'middle';
        dominantBaseline = 'auto';
        break;
      case 'bottom':
        textY += defaultOffset;
        textAnchor = 'middle';
        dominantBaseline = 'hanging';
        break;
      case 'left':
        textX -= defaultOffset;
        textAnchor = 'end';
        dominantBaseline = 'middle';
        break;
      case 'right':
        textX += defaultOffset;
        textAnchor = 'start';
        dominantBaseline = 'middle';
        break;
      case 'top-left':
        textX -= defaultOffset;
        textY -= defaultOffset;
        textAnchor = 'end';
        dominantBaseline = 'auto';
        break;
      case 'top-right':
        textX += defaultOffset;
        textY -= defaultOffset;
        textAnchor = 'start';
        dominantBaseline = 'auto';
        break;
      case 'bottom-left':
        textX -= defaultOffset;
        textY += defaultOffset;
        textAnchor = 'end';
        dominantBaseline = 'hanging';
        break;
      case 'bottom-right':
        textX += defaultOffset;
        textY += defaultOffset;
        textAnchor = 'start';
        dominantBaseline = 'hanging';
        break;
    }

    // Draw arrow if enabled
    if (showArrow) {
      const arrowLine = document.createElementNS(SVG_NS, 'line');
      arrowLine.setAttribute('x1', String(pointX));
      arrowLine.setAttribute('y1', String(pointY));
      arrowLine.setAttribute('x2', String(textX));
      arrowLine.setAttribute('y2', String(textY));
      arrowLine.setAttribute('stroke', arrowColor);
      arrowLine.setAttribute('stroke-width', '1');
      arrowLine.setAttribute('opacity', '0.6');
      annotationsGroup.appendChild(arrowLine);

      // Draw arrowhead
      const arrowSize = 5;
      const angle = Math.atan2(textY - pointY, textX - pointX);
      const arrowPoints = [
        `${pointX},${pointY}`,
        `${pointX - arrowSize * Math.cos(angle - Math.PI / 6)},${
          pointY - arrowSize * Math.sin(angle - Math.PI / 6)
        }`,
        `${pointX - arrowSize * Math.cos(angle + Math.PI / 6)},${
          pointY - arrowSize * Math.sin(angle + Math.PI / 6)
        }`,
      ].join(' ');

      const arrowHead = document.createElementNS(SVG_NS, 'polygon');
      arrowHead.setAttribute('points', arrowPoints);
      arrowHead.setAttribute('fill', arrowColor);
      arrowHead.setAttribute('opacity', '0.6');
      annotationsGroup.appendChild(arrowHead);
    }

    // Draw text
    const textElement = document.createElementNS(SVG_NS, 'text');
    textElement.setAttribute('x', String(textX));
    textElement.setAttribute('y', String(textY));
    textElement.setAttribute('text-anchor', textAnchor);
    textElement.setAttribute('dominant-baseline', dominantBaseline);
    textElement.setAttribute('fill', color);
    textElement.setAttribute('font-size', String(fontSize));
    textElement.setAttribute('font-weight', fontWeight);
    textElement.textContent = text;
    annotationsGroup.appendChild(textElement);
  });

  svg.appendChild(annotationsGroup);
}

export function renderRegions(
  svg: SVGSVGElement,
  config: BaseChartConfig,
  dimensions: Dimensions,
  bounds: ChartBounds
): void {
  const regions = config.regions;
  if (!regions) return;

  const colors = getThemeColors(config.theme || 'default');
  const { margin } = dimensions;
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  // Create a group for regions (render first so they appear behind data)
  const regionsGroup = createGroup(margin.left, margin.top);
  regionsGroup.classList.add('chart-regions');

  // Insert regions group as first child of SVG (behind everything)
  const mainGroup = svg.querySelector('.chart-main');
  if (mainGroup) {
    svg.insertBefore(regionsGroup, mainGroup);
  } else {
    svg.appendChild(regionsGroup);
  }

  regions.forEach((region) => {
    const {
      axis,
      start,
      end,
      label,
      color = colors.primary,
      opacity = 0.1,
      labelPosition = 'middle',
    } = region;

    let rectX: number, rectY: number, rectWidth: number, rectHeight: number;
    let labelX: number = 0;
    let labelY: number = 0;
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';

    if (axis === 'x') {
      // Vertical region
      let startX: number, endX: number;

      if (bounds.xValues) {
        const xScale = createBandScale(bounds.xValues, [0, chartWidth], 0);
        startX = xScale.scale(String(start));
        endX = xScale.scale(String(end)) + xScale.bandwidth;
      } else {
        const xScale = createLinearScale([bounds.xMin, bounds.xMax], [0, chartWidth]);
        startX = xScale(start as number);
        endX = xScale(end as number);
      }

      rectX = startX;
      rectY = 0;
      rectWidth = endX - startX;
      rectHeight = chartHeight;

      // Label positioning
      if (labelPosition === 'start') {
        labelX = startX + 5;
      } else if (labelPosition === 'end') {
        labelX = endX - 5;
      } else {
        labelX = (startX + endX) / 2;
      }
      labelY = 15;
    } else {
      // Horizontal region
      const yScale = createLinearScale([bounds.yMin, bounds.yMax], [chartHeight, 0]);
      const startY = yScale(start as number);
      const endY = yScale(end as number);

      rectX = 0;
      rectY = endY;
      rectWidth = chartWidth;
      rectHeight = startY - endY;

      // Label positioning
      if (labelPosition === 'start') {
        labelY = startY - 5;
      } else if (labelPosition === 'end') {
        labelY = endY + 15;
      } else {
        labelY = (startY + endY) / 2;
      }
      labelX = 10;
      textAnchor = 'start';
    }

    // Draw rectangle
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', String(rectX));
    rect.setAttribute('y', String(rectY));
    rect.setAttribute('width', String(rectWidth));
    rect.setAttribute('height', String(rectHeight));
    rect.setAttribute('fill', color);
    rect.setAttribute('opacity', String(opacity));
    regionsGroup.appendChild(rect);

    // Add label if provided
    if (label) {
      const labelText = document.createElementNS(SVG_NS, 'text');
      labelText.setAttribute('x', String(labelX));
      labelText.setAttribute('y', String(labelY));
      labelText.setAttribute('text-anchor', textAnchor);
      labelText.setAttribute('fill', color);
      labelText.setAttribute('font-size', '11');
      labelText.setAttribute('font-weight', '600');
      labelText.setAttribute('opacity', String(Math.min(opacity * 5, 0.8))); // Make label more visible
      labelText.textContent = label;
      regionsGroup.appendChild(labelText);
    }
  });
}
