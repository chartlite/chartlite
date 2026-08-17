import { describe, it, expect } from 'vitest';
import { CHART_TYPES } from '@chartlite/core/server';
import {
  renderChartResult,
  listChartTypesResult,
  CHART_TYPE_TUPLE,
  renderChartInput,
} from '../src/tools';

describe('render_chart tool', () => {
  it('renders a valid spec to SVG text (headless, via the SSR shim)', () => {
    const res = renderChartResult({
      type: 'line',
      data: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
      ],
    });
    expect(res.isError).toBeFalsy();
    expect(res.content[0].type).toBe('text');
    expect(res.content[0].text.startsWith('<svg')).toBe(true);
    expect(res.content[0].text).toContain('</svg>');
  });

  it('returns a tool error (not a throw) for an unknown type', () => {
    // @ts-expect-error intentionally invalid type
    const res = renderChartResult({ type: 'donut', data: [1, 2, 3] });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/unknown chart type/i);
  });

  it('accepts the simple number[] data shape', () => {
    const res = renderChartResult({ type: 'sparkline', data: [1, 2, 3, 2, 5] });
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text).toContain('<svg');
  });
});

describe('list_chart_types tool', () => {
  it('reports every supported type and the schema', () => {
    const res = listChartTypesResult();
    const payload = JSON.parse(res.content[0].text);
    expect(payload.chartTypes).toEqual(CHART_TYPES);
    expect(payload.schema.properties.type.enum).toEqual(CHART_TYPES);
  });
});

describe('schema drift guard', () => {
  it('the tool enum tuple matches the core render registry', () => {
    expect([...CHART_TYPE_TUPLE]).toEqual(CHART_TYPES);
  });

  it('validates flexible data without discarding chart-specific options', () => {
    const result = renderChartInput.spec.safeParse({
      type: 'scatter',
      data: {
        x: [1, 2],
        y: { actual: [3, 4], forecast: [5, 6] },
      },
      pointShape: 'square',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pointShape).toBe('square');
    }
  });

  it('rejects malformed data and unknown themes at the tool boundary', () => {
    expect(renderChartInput.spec.safeParse({
      type: 'line',
      data: [{ x: 'Jan', y: 'ten' }],
    }).success).toBe(false);

    expect(renderChartInput.spec.safeParse({
      type: 'line',
      data: [1, 2, 3],
      theme: 'corporate-neon',
    }).success).toBe(false);
  });
});
