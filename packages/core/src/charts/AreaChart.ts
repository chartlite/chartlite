/**
 * AreaChart implementation
 */

import { BaseChart } from './BaseChart';
import type { AreaChartConfig } from '../types';
import {
  createLinearScale,
  createBandScale,
  generateLinePath,
  getAllXValues,
} from '../utils';
import { setDataPointAttrs, setSeriesAttrs } from '../render/dataAttrs';
import { createSVGElement } from '../render/constants';

/**
 * Module-level sequence so every chart instance gets gradient ids that are
 * unique across the page (avoids `<linearGradient>` id collisions when several
 * area charts share a document) while staying stable across a chart's re-renders.
 */
let areaInstanceSeq = 0;

export class AreaChart extends BaseChart {
  protected config: AreaChartConfig;
  private readonly instanceId = ++areaInstanceSeq;

  constructor(container: HTMLElement | string, config: AreaChartConfig) {
    super(container, config, config.data, 'Area');

    this.config = {
      curve: 'linear',
      fillOpacity: 0.3,
      gradient: true,
      ...config,
    };
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();
    const { margin } = this.dimensions;
    const chartWidth = this.dimensions.width - margin.left - margin.right;
    const chartHeight = this.dimensions.height - margin.top - margin.bottom;

    // Create main group
    const mainGroup = this.createGroup(margin.left, margin.top);
    mainGroup.classList.add('chart-main');
    this.svg.appendChild(mainGroup);

    // Get all unique x values
    const xValues = getAllXValues(this.seriesData).map(String);

    // For stacked areas, we need to calculate cumulative values
    const stackedData = this.calculateStackedData(xValues);

    // Diverging stacks keep positive and negative values on opposite sides of zero.
    let yMin = 0;
    let yMax = 0;
    for (const series of stackedData) {
      for (const point of series.cumulativeData) {
        yMin = Math.min(yMin, point.y0, point.y1);
        yMax = Math.max(yMax, point.y0, point.y1);
      }
    }
    if (yMin === yMax) yMax = yMin + 1;

    // Set chart bounds for Phase 2 features
    this.chartBounds = {
      xMin: 0,
      xMax: xValues.length - 1,
      yMin,
      yMax,
      xValues,
    };

    // Create scales
    const xScale = createBandScale(xValues, [0, chartWidth], 0);
    const yScale = createLinearScale([yMin, yMax], [chartHeight, 0]);

    // Render axes using shared method
    this.renderCategoricalXLinearYAxes(mainGroup, xValues, yMin, yMax, chartWidth, chartHeight, colors);

    // Gradient fills need a <defs> to hold the <linearGradient> definitions.
    const useGradient = this.config.gradient !== false;
    let defs: SVGDefsElement | null = null;
    if (useGradient) {
      defs = createSVGElement('defs');
      this.svg.appendChild(defs);
    }

    // Render each series as a stacked area (in reverse order so first series is on top)
    stackedData.forEach((seriesStack, seriesIndex) => {
      // Generate points for the top line
      const topPoints = seriesStack.cumulativeData.map((d) => ({
        x: xScale.scale(String(d.x)) + xScale.bandwidth / 2,
        y: yScale(d.y1),
      }));

      // Generate points for the bottom line (reversed)
      const bottomPoints = seriesStack.cumulativeData.map((d) => ({
        x: xScale.scale(String(d.x)) + xScale.bandwidth / 2,
        y: yScale(d.y0),
      })).reverse();

      // Create area path (fill)
      const seriesColor = seriesStack.color || colors.primary;
      const areaPath = this.generateStackedAreaPath(topPoints, bottomPoints);
      const area = createSVGElement('path');
      area.setAttribute('d', areaPath);
      if (useGradient && defs) {
        // Vertical fade from the series color (at fillOpacity) down to transparent —
        // the classic "beautiful area" look. Stops carry the alpha, so no flat opacity.
        const gradientId = `cl-area-grad-${this.instanceId}-${seriesIndex}`;
        defs.appendChild(this.createFillGradient(gradientId, seriesColor));
        area.setAttribute('fill', `url(#${gradientId})`);
      } else {
        area.setAttribute('fill', seriesColor);
        area.setAttribute('opacity', String(this.config.fillOpacity));
      }
      area.classList.add('area-fill');
      area.classList.add('data-series');

      // ARIA attributes for the area series
      area.setAttribute('role', 'img');
      const dataPoints = seriesStack.cumulativeData.length;
      const seriesLabel = this.seriesData.length > 1 ? `${seriesStack.name}, ` : '';
      area.setAttribute('aria-label', `${seriesLabel}Area series with ${dataPoints} data points`);
      area.setAttribute('tabindex', '-1');
      setSeriesAttrs(area, seriesIndex, seriesStack.name);

      mainGroup.appendChild(area);

      // Create line path (stroke) for top edge
      const linePath = generateLinePath(topPoints, this.config.curve);
      const line = createSVGElement('path');
      line.setAttribute('d', linePath);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', seriesStack.color || colors.primary);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('stroke-linejoin', 'round');
      line.classList.add('area-line');

      // ARIA attributes for the line
      line.setAttribute('role', 'presentation'); // Decorative - area already has semantics
      line.setAttribute('aria-hidden', 'true'); // Hide from screen readers (area is sufficient)
      setSeriesAttrs(line, seriesIndex, seriesStack.name);

      mainGroup.appendChild(line);

      // Transparent hit targets provide point-level keyboard and interaction parity
      // without changing the visual appearance of the area.
      seriesStack.cumulativeData.forEach((point) => {
        if (point.index === undefined) return;
        const cx = xScale.scale(String(point.x)) + xScale.bandwidth / 2;
        const cy = yScale(point.y1);
        const hitTarget = createSVGElement('circle');
        hitTarget.setAttribute('cx', String(cx));
        hitTarget.setAttribute('cy', String(cy));
        hitTarget.setAttribute('r', '8');
        hitTarget.setAttribute('fill', 'transparent');
        hitTarget.setAttribute('role', 'img');
        hitTarget.setAttribute('tabindex', '-1');
        hitTarget.setAttribute(
          'aria-label',
          `${seriesStack.name}, ${point.x}: ${point.value}`
        );
        hitTarget.classList.add('data-point');
        setDataPointAttrs(hitTarget, point.x, point.value, seriesStack.name, seriesIndex, point.index, cx, cy);
        mainGroup.appendChild(hitTarget);
      });
    });
  }

  /**
   * Calculate stacked data for multi-series areas
   */
  private calculateStackedData(xValues: string[]): Array<{
    name: string;
    color?: string;
    cumulativeData: Array<{
      x: string | number;
      y0: number;
      y1: number;
      value: number;
      index?: number;
    }>;
  }> {
    const positive = new Map(xValues.map((x) => [x, 0]));
    const negative = new Map(xValues.map((x) => [x, 0]));

    return this.seriesData.map((series) => {
      const points = new Map(
        series.data.map((point, index) => [String(point.x), { point, index }])
      );
      const cumulativeData = xValues.map((xVal) => {
        const source = points.get(xVal);
        const value = source?.point.y ?? 0;
        const cumulative = value >= 0 ? positive : negative;
        const y0 = cumulative.get(xVal) ?? 0;
        const y1 = y0 + value;
        cumulative.set(xVal, y1);
        return { x: xVal, y0, y1, value, index: source?.index };
      });

      return {
        name: series.name,
        color: series.color,
        cumulativeData,
      };
    });
  }

  /**
   * Generate SVG path for stacked area
   */
  private generateStackedAreaPath(
    topPoints: Array<{ x: number; y: number }>,
    bottomPoints: Array<{ x: number; y: number }>
  ): string {
    if (topPoints.length === 0) return '';

    // Generate top edge path
    const topPath = generateLinePath(topPoints, this.config.curve);

    // Generate bottom edge path
    const bottomPath = generateLinePath(bottomPoints, this.config.curve);

    // Combine: top edge + bottom edge + close
    return `${topPath} ${bottomPath.replace('M', 'L')} Z`;
  }

  /**
   * Build a vertical `<linearGradient>` fading `color` from `fillOpacity` at the
   * top to fully transparent at the bottom.
   */
  private createFillGradient(id: string, color: string): SVGLinearGradientElement {
    const topOpacity = this.config.fillOpacity ?? 0.3;
    const gradient = createSVGElement('linearGradient');
    gradient.setAttribute('id', id);
    // Gradient runs top→bottom in the element's own coordinate box.
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('y1', '0');
    gradient.setAttribute('x2', '0');
    gradient.setAttribute('y2', '1');

    const stopTop = createSVGElement('stop');
    stopTop.setAttribute('offset', '0%');
    stopTop.setAttribute('stop-color', color);
    stopTop.setAttribute('stop-opacity', String(topOpacity));
    gradient.appendChild(stopTop);

    const stopBottom = createSVGElement('stop');
    stopBottom.setAttribute('offset', '100%');
    stopBottom.setAttribute('stop-color', color);
    stopBottom.setAttribute('stop-opacity', '0');
    gradient.appendChild(stopBottom);

    return gradient;
  }
}
