---
name: chartlite
description: >-
  Create charts (line, bar, area, scatter, pie/donut, sparkline) as lightweight,
  accessible SVG using the Chartlite library. Use when asked to visualize data,
  generate a chart image/SVG, add charts to a page, or render charts server-side or
  inside an agent sandbox (no browser needed). Covers chart-type selection, the four
  data formats, theming, and both the JS API and the MCP server.
---

# Chartlite

Chartlite renders data to **accessible SVG** with zero dependencies (~13 KB gzipped). It
runs in the browser, on the server (headless, no DOM), and via an MCP server — so it works
inside an agent sandbox where heavier libraries can't.

## Choosing a chart type

- **line** — a trend over an ordered axis (time, sequence). `curve: 'smooth'` for a curved line.
- **area** — like line, emphasizing volume; multi-series stacks.
- **bar** — compare categories. `orientation: 'horizontal'` for long labels.
- **scatter** — correlation between two numeric axes.
- **pie** (or donut via `innerRadius`) — parts of a whole; keep to ≤ ~6 slices.
- **sparkline** — a tiny, axis-less inline chart for a single metric.

## Data — four accepted formats

```ts
[{ x: 'Jan', y: 30 }, { x: 'Feb', y: 45 }]        // DataPoint[]
[30, 45, 38, 52]                                   // number[] (index is x)
{ x: ['Q1','Q2'], y: [45000, 52000] }              // column-oriented
{ series: [{ name: 'Revenue', dataKey: 'rev' }],   // series-first (multi-series)
  data: [{ x: 'Jan', rev: 4200 }, { x: 'Feb', rev: 4800 }] }
```

## The declarative spec (preferred for generation)

A **ChartSpec** is one JSON object: `{ type, data, ...options }`. It is the input to both
`renderToString` and the MCP `render_chart` tool, and is described by
`@chartlite/core/schema.json`.

Common options: `theme` (`default` | `midnight` | `minimal` | `tailwind` | `nord` |
`high-contrast`), `title`, `colors: string[]`, `width`, `height`,
`legend: { show, position, align }`, `valueFormatter`, plus per-type options (`curve`,
`orientation`, `fillOpacity`, `innerRadius`, `showLabels`, `pointSize`, `pointShape`).

## Rendering

### Server-side / headless (recommended for agents and static output)

```ts
import { renderToString } from '@chartlite/core/server';
const svg = renderToString({ type: 'bar', data: { x: ['Q1','Q2','Q3'], y: [45,52,48] }, theme: 'nord' });
// -> '<svg ...>...</svg>' — embed directly in HTML/Markdown, 0 KB client JS
```

### Via the MCP server

If the `chartlite` MCP server is available, call:
- `render_chart({ spec })` → SVG string
- `list_chart_types()` → types + JSON schema

Run it with `npx -y @chartlite/mcp`.

### Browser

```ts
import { LineChart } from '@chartlite/core';
new LineChart('#chart', { data: [{ x: 'Jan', y: 4200 }], curve: 'smooth' }).render();
```

Add interactivity (opt-in, tree-shakeable) from `@chartlite/core/interactive`:
`plugins: [tooltip(), crosshair(), legendToggle()]`.

## Rules

- Prefer the declarative spec / `renderToString` when generating a chart artifact.
- Keep the emitted SVG intact — it carries ARIA roles, labels, and a screen-reader data
  table.
- Best for ≤ ~2,000 points. For millions of points or live streaming, use a heavier tool.
