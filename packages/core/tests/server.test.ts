import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  renderToString,
  CHART_TYPES,
  chartSpecSchema,
  type ChartSpec,
} from '../src/server';

const lineData = [
  { x: 'Jan', y: 10 },
  { x: 'Feb', y: 20 },
  { x: 'Mar', y: 15 },
];

/** Run a function with the real DOM removed, so the SSR shim must be used. */
function headless<T>(fn: () => T): T {
  const g = globalThis as Record<string, unknown>;
  const savedDoc = g.document;
  const savedHtml = g.HTMLElement;
  // Force `typeof document === 'undefined'` so installDOM() installs the shim.
  delete g.document;
  delete g.HTMLElement;
  try {
    return fn();
  } finally {
    g.document = savedDoc;
    g.HTMLElement = savedHtml;
  }
}

function countTags(html: string, tag: string): number {
  return (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
}

describe('renderToString', () => {
  it('renders each chart type to an SVG string', () => {
    const specs: ChartSpec[] = [
      { type: 'line', data: lineData },
      { type: 'bar', data: lineData },
      { type: 'area', data: lineData },
      { type: 'scatter', data: [{ x: 1, y: 2 }, { x: 3, y: 4 }] },
      { type: 'pie', data: [{ x: 'A', y: 30 }, { x: 'B', y: 70 }] },
      { type: 'sparkline', data: [1, 2, 3, 2, 4] },
    ];
    for (const spec of specs) {
      const svg = renderToString(spec);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('</svg>');
      expect(svg).toContain('viewBox=');
    }
  });

  it('includes accessibility markup (title, desc, aria-label)', () => {
    const svg = renderToString({ type: 'line', data: lineData, title: 'Revenue' });
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label=');
    expect(svg).toContain('<title>');
    expect(svg).toContain('<desc>');
    expect(svg).toContain('Revenue');
  });

  it('emits the data-* contract so SSR output is hydration/interaction ready', () => {
    const svg = renderToString({ type: 'line', data: lineData });
    expect(svg).toContain('data-x="Jan"');
    expect(svg).toContain('class="data-point"');
  });

  it('respects width, height and theme', () => {
    const svg = renderToString({
      type: 'bar',
      data: lineData,
      width: 640,
      height: 480,
      theme: 'midnight',
    });
    expect(svg).toContain('width="640"');
    expect(svg).toContain('height="480"');
    // midnight theme paints a dark background via the style attribute
    expect(svg).toMatch(/background-color:/);
  });

  it('throws a helpful error on an unknown chart type', () => {
    // @ts-expect-error intentionally invalid
    expect(() => renderToString({ type: 'donut', data: lineData })).toThrow(/unknown chart type/i);
  });

  it('produces valid, well-formed SVG (parseable)', () => {
    const svg = renderToString({ type: 'line', data: lineData });
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    expect(doc.documentElement.tagName.toLowerCase()).toBe('svg');
  });
});

describe('SSR shim (no real DOM)', () => {
  it('renders headless with no document present', () => {
    const svg = headless(() => renderToString({ type: 'line', data: lineData }));
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="data-point"');
  });

  it('matches the jsdom render structurally (golden)', () => {
    const spec: ChartSpec = { type: 'line', data: lineData, title: 'X' };
    const domSvg = renderToString(spec); // uses real jsdom document
    const shimSvg = headless(() => renderToString(spec)); // uses the shim

    for (const tag of ['path', 'circle', 'text', 'line', 'title', 'desc']) {
      expect(countTags(shimSvg, tag)).toBe(countTags(domSvg, tag));
    }
  });

  it('restores the global document afterwards', () => {
    headless(() => renderToString({ type: 'line', data: lineData }));
    expect(typeof document).toBe('object');
  });
});

describe('chart spec schema', () => {
  it('type enum matches the render registry', () => {
    expect(chartSpecSchema.properties.type.enum).toEqual(CHART_TYPES);
  });

  it('checked-in schema.json is in sync with the source of truth', () => {
    // vitest runs with cwd = package root; fall back to the nested path just in case.
    const candidates = [resolve(process.cwd(), 'schema.json'), resolve(process.cwd(), 'packages/core/schema.json')];
    const path = candidates.find((p) => existsSync(p));
    expect(path, 'schema.json not found').toBeTruthy();
    const onDisk = readFileSync(path!, 'utf8');
    expect(JSON.parse(onDisk)).toEqual(chartSpecSchema);
  });
});
