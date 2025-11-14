import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineChart } from '../src/charts/LineChart';
import { BarChart } from '../src/charts/BarChart';
import { ScatterChart } from '../src/charts/ScatterChart';
import type { DataPoint } from '../src/types';

describe('Phase 2 Features: Reference Lines, Annotations, and Regions', () => {
  let container: HTMLDivElement;
  let data: DataPoint[];

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-chart';
    document.body.appendChild(container);

    data = [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 45 },
      { x: 'Mar', y: 38 },
      { x: 'Apr', y: 52 },
      { x: 'May', y: 60 },
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Reference Lines', () => {
    describe('Horizontal reference lines (y-axis)', () => {
      it('should render a horizontal reference line', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              label: 'Goal',
            },
          ],
        });
        chart.render();

        const refLinesGroup = container.querySelector('.chart-reference-lines');
        expect(refLinesGroup).toBeTruthy();

        const lines = refLinesGroup?.querySelectorAll('line');
        expect(lines?.length).toBe(1);
      });

      it('should render horizontal reference line with custom color', () => {
        const customColor = '#ff0000';
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              color: customColor,
            },
          ],
        });
        chart.render();

        const line = container.querySelector('.chart-reference-lines line');
        expect(line?.getAttribute('stroke')).toBe(customColor);
      });

      it('should render horizontal reference line with dashed style', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              style: 'dashed',
            },
          ],
        });
        chart.render();

        const line = container.querySelector('.chart-reference-lines line');
        expect(line?.getAttribute('stroke-dasharray')).toBe('8 4');
      });

      it('should render horizontal reference line with dotted style', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              style: 'dotted',
            },
          ],
        });
        chart.render();

        const line = container.querySelector('.chart-reference-lines line');
        expect(line?.getAttribute('stroke-dasharray')).toBe('2 2');
      });

      it('should render horizontal reference line with solid style', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              style: 'solid',
            },
          ],
        });
        chart.render();

        const line = container.querySelector('.chart-reference-lines line');
        expect(line?.getAttribute('stroke-dasharray')).toBeFalsy();
      });

      it('should render horizontal reference line with custom stroke width', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              strokeWidth: 4,
            },
          ],
        });
        chart.render();

        const line = container.querySelector('.chart-reference-lines line');
        expect(line?.getAttribute('stroke-width')).toBe('4');
      });

      it('should render horizontal reference line label', () => {
        const labelText = 'Target Goal';
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              label: labelText,
            },
          ],
        });
        chart.render();

        const texts = container.querySelectorAll('.chart-reference-lines text');
        const label = Array.from(texts).find((t) => t.textContent === labelText);
        expect(label).toBeTruthy();
      });

      it('should position horizontal reference line label at start', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              label: 'Start',
              labelPosition: 'start',
            },
          ],
        });
        chart.render();

        const label = container.querySelector('.chart-reference-lines text');
        expect(label?.getAttribute('text-anchor')).toBe('start');
      });

      it('should position horizontal reference line label at middle', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              label: 'Middle',
              labelPosition: 'middle',
            },
          ],
        });
        chart.render();

        const label = container.querySelector('.chart-reference-lines text');
        expect(label?.getAttribute('text-anchor')).toBe('middle');
      });

      it('should position horizontal reference line label at end by default', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'y',
              value: 50,
              label: 'End',
            },
          ],
        });
        chart.render();

        const label = container.querySelector('.chart-reference-lines text');
        expect(label?.getAttribute('text-anchor')).toBe('end');
      });
    });

    describe('Vertical reference lines (x-axis)', () => {
      it('should render a vertical reference line on categorical x-axis', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'x',
              value: 'Mar',
              label: 'Milestone',
            },
          ],
        });
        chart.render();

        const refLinesGroup = container.querySelector('.chart-reference-lines');
        expect(refLinesGroup).toBeTruthy();

        const lines = refLinesGroup?.querySelectorAll('line');
        expect(lines?.length).toBe(1);
      });

      it('should render a vertical reference line on numeric x-axis', () => {
        const scatterData = [
          { x: 10, y: 30 },
          { x: 20, y: 45 },
          { x: 30, y: 38 },
        ];
        const chart = new ScatterChart(container, {
          data: scatterData,
          referenceLines: [
            {
              axis: 'x',
              value: 20,
              label: 'Event',
            },
          ],
        });
        chart.render();

        const refLinesGroup = container.querySelector('.chart-reference-lines');
        expect(refLinesGroup).toBeTruthy();

        const lines = refLinesGroup?.querySelectorAll('line');
        expect(lines?.length).toBe(1);
      });

      it('should render vertical reference line with label', () => {
        const labelText = 'Product Launch';
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            {
              axis: 'x',
              value: 'Mar',
              label: labelText,
            },
          ],
        });
        chart.render();

        const texts = container.querySelectorAll('.chart-reference-lines text');
        const label = Array.from(texts).find((t) => t.textContent === labelText);
        expect(label).toBeTruthy();
      });
    });

    describe('Multiple reference lines', () => {
      it('should render multiple reference lines', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            { axis: 'y', value: 40 },
            { axis: 'y', value: 50 },
            { axis: 'x', value: 'Mar' },
          ],
        });
        chart.render();

        const lines = container.querySelectorAll('.chart-reference-lines line');
        expect(lines.length).toBe(3);
      });

      it('should render each reference line with its own color', () => {
        const chart = new LineChart(container, {
          data,
          referenceLines: [
            { axis: 'y', value: 40, color: '#ff0000' },
            { axis: 'y', value: 50, color: '#00ff00' },
          ],
        });
        chart.render();

        const lines = container.querySelectorAll('.chart-reference-lines line');
        expect(lines[0].getAttribute('stroke')).toBe('#ff0000');
        expect(lines[1].getAttribute('stroke')).toBe('#00ff00');
      });
    });
  });

  describe('Annotations', () => {
    it('should render an annotation', () => {
      const chart = new LineChart(container, {
        data,
        annotations: [
          {
            x: 'Mar',
            y: 38,
            text: 'Important Point',
          },
        ],
      });
      chart.render();

      const annotationsGroup = container.querySelector('.chart-annotations');
      expect(annotationsGroup).toBeTruthy();

      const texts = annotationsGroup?.querySelectorAll('text');
      expect(texts?.length).toBe(1);
      expect(texts?.[0].textContent).toBe('Important Point');
    });

    it('should render annotation with custom color', () => {
      const customColor = '#ff0000';
      const chart = new LineChart(container, {
        data,
        annotations: [
          {
            x: 'Mar',
            y: 38,
            text: 'Red Text',
            color: customColor,
          },
        ],
      });
      chart.render();

      const text = container.querySelector('.chart-annotations text');
      expect(text?.getAttribute('fill')).toBe(customColor);
    });

    it('should render annotation with custom font size', () => {
      const chart = new LineChart(container, {
        data,
        annotations: [
          {
            x: 'Mar',
            y: 38,
            text: 'Large Text',
            fontSize: 16,
          },
        ],
      });
      chart.render();

      const text = container.querySelector('.chart-annotations text');
      expect(text?.getAttribute('font-size')).toBe('16');
    });

    it('should render annotation with bold font weight', () => {
      const chart = new LineChart(container, {
        data,
        annotations: [
          {
            x: 'Mar',
            y: 38,
            text: 'Bold Text',
            fontWeight: 'bold',
          },
        ],
      });
      chart.render();

      const text = container.querySelector('.chart-annotations text');
      expect(text?.getAttribute('font-weight')).toBe('bold');
    });

    describe('Annotation anchors', () => {
      it('should position annotation at top', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Top',
              anchor: 'top',
            },
          ],
        });
        chart.render();

        const text = container.querySelector('.chart-annotations text');
        expect(text?.getAttribute('text-anchor')).toBe('middle');
        expect(text?.getAttribute('dominant-baseline')).toBe('auto');
      });

      it('should position annotation at bottom', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Bottom',
              anchor: 'bottom',
            },
          ],
        });
        chart.render();

        const text = container.querySelector('.chart-annotations text');
        expect(text?.getAttribute('text-anchor')).toBe('middle');
        expect(text?.getAttribute('dominant-baseline')).toBe('hanging');
      });

      it('should position annotation at left', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Left',
              anchor: 'left',
            },
          ],
        });
        chart.render();

        const text = container.querySelector('.chart-annotations text');
        expect(text?.getAttribute('text-anchor')).toBe('end');
        expect(text?.getAttribute('dominant-baseline')).toBe('middle');
      });

      it('should position annotation at right', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Right',
              anchor: 'right',
            },
          ],
        });
        chart.render();

        const text = container.querySelector('.chart-annotations text');
        expect(text?.getAttribute('text-anchor')).toBe('start');
        expect(text?.getAttribute('dominant-baseline')).toBe('middle');
      });

      it('should position annotation at top-left', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Top-Left',
              anchor: 'top-left',
            },
          ],
        });
        chart.render();

        const text = container.querySelector('.chart-annotations text');
        expect(text?.getAttribute('text-anchor')).toBe('end');
        expect(text?.getAttribute('dominant-baseline')).toBe('auto');
      });

      it('should position annotation at top-right', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Top-Right',
              anchor: 'top-right',
            },
          ],
        });
        chart.render();

        const text = container.querySelector('.chart-annotations text');
        expect(text?.getAttribute('text-anchor')).toBe('start');
        expect(text?.getAttribute('dominant-baseline')).toBe('auto');
      });

      it('should position annotation at bottom-left', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Bottom-Left',
              anchor: 'bottom-left',
            },
          ],
        });
        chart.render();

        const text = container.querySelector('.chart-annotations text');
        expect(text?.getAttribute('text-anchor')).toBe('end');
        expect(text?.getAttribute('dominant-baseline')).toBe('hanging');
      });

      it('should position annotation at bottom-right', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Bottom-Right',
              anchor: 'bottom-right',
            },
          ],
        });
        chart.render();

        const text = container.querySelector('.chart-annotations text');
        expect(text?.getAttribute('text-anchor')).toBe('start');
        expect(text?.getAttribute('dominant-baseline')).toBe('hanging');
      });
    });

    describe('Annotation arrows', () => {
      it('should render arrow when showArrow is true', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'With Arrow',
              showArrow: true,
            },
          ],
        });
        chart.render();

        const annotationsGroup = container.querySelector('.chart-annotations');
        const line = annotationsGroup?.querySelector('line');
        const polygon = annotationsGroup?.querySelector('polygon');

        expect(line).toBeTruthy();
        expect(polygon).toBeTruthy();
      });

      it('should not render arrow when showArrow is false', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'No Arrow',
              showArrow: false,
            },
          ],
        });
        chart.render();

        const annotationsGroup = container.querySelector('.chart-annotations');
        const line = annotationsGroup?.querySelector('line');
        const polygon = annotationsGroup?.querySelector('polygon');

        expect(line).toBeFalsy();
        expect(polygon).toBeFalsy();
      });

      it('should render arrow with custom color', () => {
        const customColor = '#ff0000';
        const chart = new LineChart(container, {
          data,
          annotations: [
            {
              x: 'Mar',
              y: 38,
              text: 'Red Arrow',
              showArrow: true,
              arrowColor: customColor,
            },
          ],
        });
        chart.render();

        const line = container.querySelector('.chart-annotations line');
        const polygon = container.querySelector('.chart-annotations polygon');

        expect(line?.getAttribute('stroke')).toBe(customColor);
        expect(polygon?.getAttribute('fill')).toBe(customColor);
      });
    });

    describe('Multiple annotations', () => {
      it('should render multiple annotations', () => {
        const chart = new LineChart(container, {
          data,
          annotations: [
            { x: 'Jan', y: 30, text: 'Start' },
            { x: 'Mar', y: 38, text: 'Middle' },
            { x: 'May', y: 60, text: 'End' },
          ],
        });
        chart.render();

        const texts = container.querySelectorAll('.chart-annotations text');
        expect(texts.length).toBe(3);
      });
    });
  });

  describe('Regions', () => {
    describe('Vertical regions (x-axis)', () => {
      it('should render a vertical region on categorical x-axis', () => {
        const chart = new LineChart(container, {
          data,
          regions: [
            {
              axis: 'x',
              start: 'Feb',
              end: 'Apr',
              label: 'Q1',
            },
          ],
        });
        chart.render();

        const regionsGroup = container.querySelector('.chart-regions');
        expect(regionsGroup).toBeTruthy();

        const rects = regionsGroup?.querySelectorAll('rect');
        expect(rects?.length).toBe(1);
      });

      it('should render vertical region on numeric x-axis', () => {
        const scatterData = [
          { x: 10, y: 30 },
          { x: 20, y: 45 },
          { x: 30, y: 38 },
          { x: 40, y: 50 },
        ];
        const chart = new ScatterChart(container, {
          data: scatterData,
          regions: [
            {
              axis: 'x',
              start: 15,
              end: 35,
            },
          ],
        });
        chart.render();

        const rects = container.querySelectorAll('.chart-regions rect');
        expect(rects.length).toBe(1);
      });

      it('should render vertical region with custom color', () => {
        const customColor = '#3b82f6';
        const chart = new LineChart(container, {
          data,
          regions: [
            {
              axis: 'x',
              start: 'Feb',
              end: 'Apr',
              color: customColor,
            },
          ],
        });
        chart.render();

        const rect = container.querySelector('.chart-regions rect');
        expect(rect?.getAttribute('fill')).toBe(customColor);
      });

      it('should render vertical region with custom opacity', () => {
        const chart = new LineChart(container, {
          data,
          regions: [
            {
              axis: 'x',
              start: 'Feb',
              end: 'Apr',
              opacity: 0.3,
            },
          ],
        });
        chart.render();

        const rect = container.querySelector('.chart-regions rect');
        expect(rect?.getAttribute('opacity')).toBe('0.3');
      });

      it('should render vertical region with label', () => {
        const labelText = 'Q1 2024';
        const chart = new LineChart(container, {
          data,
          regions: [
            {
              axis: 'x',
              start: 'Feb',
              end: 'Apr',
              label: labelText,
            },
          ],
        });
        chart.render();

        const texts = container.querySelectorAll('.chart-regions text');
        const label = Array.from(texts).find((t) => t.textContent === labelText);
        expect(label).toBeTruthy();
      });
    });

    describe('Horizontal regions (y-axis)', () => {
      it('should render a horizontal region', () => {
        const chart = new LineChart(container, {
          data,
          regions: [
            {
              axis: 'y',
              start: 30,
              end: 45,
              label: 'Target Range',
            },
          ],
        });
        chart.render();

        const regionsGroup = container.querySelector('.chart-regions');
        expect(regionsGroup).toBeTruthy();

        const rects = regionsGroup?.querySelectorAll('rect');
        expect(rects?.length).toBe(1);
      });

      it('should render horizontal region with label', () => {
        const labelText = 'Acceptable Range';
        const chart = new LineChart(container, {
          data,
          regions: [
            {
              axis: 'y',
              start: 35,
              end: 55,
              label: labelText,
            },
          ],
        });
        chart.render();

        const texts = container.querySelectorAll('.chart-regions text');
        const label = Array.from(texts).find((t) => t.textContent === labelText);
        expect(label).toBeTruthy();
      });
    });

    describe('Multiple regions', () => {
      it('should render multiple regions', () => {
        const chart = new LineChart(container, {
          data,
          regions: [
            { axis: 'x', start: 'Jan', end: 'Feb', label: 'Period 1' },
            { axis: 'x', start: 'Apr', end: 'May', label: 'Period 2' },
            { axis: 'y', start: 40, end: 50, label: 'Range' },
          ],
        });
        chart.render();

        const rects = container.querySelectorAll('.chart-regions rect');
        expect(rects.length).toBe(3);
      });

      it('should render each region with its own color', () => {
        const chart = new LineChart(container, {
          data,
          regions: [
            { axis: 'x', start: 'Jan', end: 'Feb', color: '#ff0000' },
            { axis: 'x', start: 'Apr', end: 'May', color: '#00ff00' },
          ],
        });
        chart.render();

        const rects = container.querySelectorAll('.chart-regions rect');
        expect(rects[0].getAttribute('fill')).toBe('#ff0000');
        expect(rects[1].getAttribute('fill')).toBe('#00ff00');
      });
    });

    describe('Region rendering order', () => {
      it('should render regions behind chart data', () => {
        const chart = new LineChart(container, {
          data,
          regions: [
            {
              axis: 'x',
              start: 'Feb',
              end: 'Apr',
            },
          ],
        });
        chart.render();

        const svg = container.querySelector('svg');
        const regionsGroup = svg?.querySelector('.chart-regions');
        const mainGroup = svg?.querySelector('.chart-main');

        expect(regionsGroup).toBeTruthy();
        expect(mainGroup).toBeTruthy();

        // Regions should come before main chart group in DOM
        const children = Array.from(svg?.children || []);
        const regionsIndex = children.indexOf(regionsGroup as Element);
        const mainIndex = children.indexOf(mainGroup as Element);

        expect(regionsIndex).toBeLessThan(mainIndex);
      });
    });
  });

  describe('Combined features', () => {
    it('should render reference lines, annotations, and regions together', () => {
      const chart = new LineChart(container, {
        data,
        referenceLines: [
          { axis: 'y', value: 50, label: 'Goal' },
        ],
        annotations: [
          { x: 'Mar', y: 38, text: 'Important' },
        ],
        regions: [
          { axis: 'x', start: 'Feb', end: 'Apr', label: 'Focus Period' },
        ],
      });
      chart.render();

      expect(container.querySelector('.chart-reference-lines')).toBeTruthy();
      expect(container.querySelector('.chart-annotations')).toBeTruthy();
      expect(container.querySelector('.chart-regions')).toBeTruthy();
    });

    it('should render all features with correct layering', () => {
      const chart = new LineChart(container, {
        data,
        referenceLines: [{ axis: 'y', value: 50 }],
        annotations: [{ x: 'Mar', y: 38, text: 'Point' }],
        regions: [{ axis: 'x', start: 'Feb', end: 'Apr' }],
      });
      chart.render();

      const svg = container.querySelector('svg');
      const children = Array.from(svg?.children || []);

      const regionsGroup = svg?.querySelector('.chart-regions');
      const mainGroup = svg?.querySelector('.chart-main');
      const refLinesGroup = svg?.querySelector('.chart-reference-lines');
      const annotationsGroup = svg?.querySelector('.chart-annotations');

      const regionsIndex = children.indexOf(regionsGroup as Element);
      const mainIndex = children.indexOf(mainGroup as Element);
      const refLinesIndex = children.indexOf(refLinesGroup as Element);
      const annotationsIndex = children.indexOf(annotationsGroup as Element);

      // Regions should be first (behind everything)
      expect(regionsIndex).toBeLessThan(mainIndex);
      // Reference lines and annotations should be after main chart
      expect(mainIndex).toBeLessThan(refLinesIndex);
      expect(mainIndex).toBeLessThan(annotationsIndex);
    });
  });

  describe('Chart type compatibility', () => {
    it('should work with BarChart', () => {
      const chart = new BarChart(container, {
        data,
        referenceLines: [{ axis: 'y', value: 50 }],
        annotations: [{ x: 'Mar', y: 38, text: 'Peak' }],
        regions: [{ axis: 'x', start: 'Feb', end: 'Apr' }],
      });
      chart.render();

      expect(container.querySelector('.chart-reference-lines')).toBeTruthy();
      expect(container.querySelector('.chart-annotations')).toBeTruthy();
      expect(container.querySelector('.chart-regions')).toBeTruthy();
    });

    it('should work with ScatterChart', () => {
      const scatterData = [
        { x: 10, y: 30 },
        { x: 20, y: 45 },
        { x: 30, y: 38 },
      ];
      const chart = new ScatterChart(container, {
        data: scatterData,
        referenceLines: [{ axis: 'y', value: 40 }],
        annotations: [{ x: 20, y: 45, text: 'High' }],
        regions: [{ axis: 'x', start: 15, end: 25 }],
      });
      chart.render();

      expect(container.querySelector('.chart-reference-lines')).toBeTruthy();
      expect(container.querySelector('.chart-annotations')).toBeTruthy();
      expect(container.querySelector('.chart-regions')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty reference lines array', () => {
      const chart = new LineChart(container, {
        data,
        referenceLines: [],
      });
      chart.render();

      expect(container.querySelector('.chart-reference-lines')).toBeFalsy();
    });

    it('should handle empty annotations array', () => {
      const chart = new LineChart(container, {
        data,
        annotations: [],
      });
      chart.render();

      expect(container.querySelector('.chart-annotations')).toBeFalsy();
    });

    it('should handle empty regions array', () => {
      const chart = new LineChart(container, {
        data,
        regions: [],
      });
      chart.render();

      expect(container.querySelector('.chart-regions')).toBeFalsy();
    });

    it('should handle undefined Phase 2 features', () => {
      const chart = new LineChart(container, { data });
      chart.render();

      expect(container.querySelector('.chart-reference-lines')).toBeFalsy();
      expect(container.querySelector('.chart-annotations')).toBeFalsy();
      expect(container.querySelector('.chart-regions')).toBeFalsy();
    });
  });
});
