/**
 * AreaChart implementation
 */

import { BaseChart } from './BaseChart';
import type { AreaChartConfig } from '../types';
import { generateLinePath, getAllXValues } from '../utils';
import { markDataPoint, setSeriesAttrs } from '../render/dataAttrs';
import { svgEl } from '../render/constants';

/**
 * Module-level sequence so every chart instance gets gradient ids that are
 * unique across the page (avoids `<linearGradient>` id collisions when several
 * area charts share a document) while staying stable across a chart's re-renders.
 */
let areaInstanceSeq = 0;

export class AreaChart extends BaseChart {
  declare protected config: AreaChartConfig;
  private readonly instanceId = ++areaInstanceSeq;

  constructor(container: HTMLElement | string, config: AreaChartConfig) {
    super(container, { curve: 'linear', fillOpacity: 0.3, gradient: true, ...config }, config.data, 'Area');
  }

  protected renderChart(): void {
    if (!this.svg) return;

    const colors = this.themeColors();
    const xValues = getAllXValues(this.seriesData).map(String);

    // Multi-series areas stack; positive and negative values diverge from zero.
    const stackedData = this.calculateStackedData(xValues);
    let yMin = 0;
    let yMax = 0;
    for (const series of stackedData) {
      for (const point of series.cumulativeData) {
        yMin = Math.min(yMin, point.y0, point.y1);
        yMax = Math.max(yMax, point.y0, point.y1);
      }
    }

    const plot = this.plot(xValues, [yMin, yMax], true);
    const centerX = (x: string | number) => plot.x(x) + plot.bw / 2;

    // A fade to transparent flatters a single area, but washes out the lower
    // bands of a stack, so stacked (multi-series) areas use a flat fill.
    const useGradient = this.config.gradient !== false && stackedData.length === 1;
    const opacity = this.config.fillOpacity ?? 0.3;

    stackedData.forEach((seriesStack, seriesIndex) => {
      const topPoints = seriesStack.cumulativeData.map((d) => ({ x: centerX(d.x), y: plot.y(d.y1) }));
      const bottomPoints = seriesStack.cumulativeData
        .map((d) => ({ x: centerX(d.x), y: plot.y(d.y0) }))
        .reverse();
      const topPath = generateLinePath(topPoints, this.config.curve);

      const seriesColor = seriesStack.color || colors.primary;
      let fill = seriesColor;
      if (useGradient) {
        // Vertical fade (top→bottom of the area's box) from the series color at
        // fillOpacity down to transparent.
        const id = `cl-area-grad-${this.instanceId}-${seriesIndex}`;
        const gradient = svgEl('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, svgEl('defs', {}, plot.g));
        svgEl('stop', { offset: '0%', 'stop-color': seriesColor, 'stop-opacity': opacity }, gradient);
        svgEl('stop', { offset: '100%', 'stop-color': seriesColor, 'stop-opacity': 0 }, gradient);
        fill = `url(#${id})`;
      }
      const seriesLabel = this.seriesData.length > 1 ? `${seriesStack.name}, ` : '';
      const area = svgEl('path', {
        // Top edge forward, bottom edge back.
        d: topPath && `${topPath}${generateLinePath(bottomPoints, this.config.curve).replace('M', 'L')}Z`,
        fill,
        opacity: useGradient ? undefined : opacity,
        role: 'img',
        'aria-label': `${seriesLabel}Area series with ${seriesStack.cumulativeData.length} data points`,
        tabindex: '-1',
      }, plot.g);
      area.classList.add('area-fill');
      area.classList.add('data-series');
      setSeriesAttrs(area, seriesIndex, seriesStack.name);

      // Top edge stroke: decorative, the area already carries the semantics.
      const line = svgEl('path', {
        d: topPath,
        fill: 'none',
        stroke: seriesColor,
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        role: 'presentation',
        'aria-hidden': 'true',
      }, plot.g);
      line.classList.add('area-line');
      setSeriesAttrs(line, seriesIndex, seriesStack.name);

      // Transparent hit targets provide point-level keyboard and interaction parity
      // without changing the visual appearance of the area.
      seriesStack.cumulativeData.forEach((point) => {
        if (point.index === undefined) return;
        const cx = centerX(point.x);
        const cy = plot.y(point.y1);
        const hitTarget = svgEl('circle', { cx, cy, r: 8, fill: 'transparent' }, plot.g);
        markDataPoint(hitTarget, `${seriesStack.name}, ${point.x}: ${point.value}`, point.x, point.value, seriesStack.name, seriesIndex, point.index, cx, cy);
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
}
