# Skill: Chartlite charts

Render data as lightweight, accessible SVG charts with Chartlite. Use this whenever the
user wants to visualize numbers — a trend, a comparison, a breakdown — or asks for a chart
image/SVG to embed in a page, email, or document.

## When to use

- "Chart/plot/graph this data", "show me a visualization", "add a chart to the page".
- Producing a static SVG (no client JS) for SSR, Markdown, or an agent response.

## How to use

Call the `render_chart` tool with a **spec**: `{ type, data, ...options }`.

Pick `type`:
- `line` / `area` — trends over an ordered axis
- `bar` — compare categories (`orientation: 'horizontal'` for long labels)
- `pie` — parts of a whole (≤ ~6 slices; donut via `innerRadius`)
- `scatter` — correlation between two numeric axes
- `radial` — progress rings or a gauge for a single KPI
- `combo` — bars plus a line/area trend on shared axes
- `sparkline` — a tiny inline metric (`variant: 'line' | 'area'`)

`data` accepts `DataPoint[]` (`[{x,y}]`), `number[]`, column (`{x:[],y:[]}`),
series-first (`{series:[...],data:[...]}`), or row objects
(`[{ month: 'Jan', revenue: 10, costs: 4 }]`: first non-numeric key is x, each numeric key
a series).

Useful options: `theme` (`default`, `midnight`, `minimal`, `tailwind`, `nord`,
`high-contrast`), `title`, `colors`, `width`, `height`, `legend` (`true`/`false` or
`{ show, position }`; shown automatically for 2+ series, slices, or rings), `maxPoints`
(default 500; `0` disables downsampling).

The tool returns an SVG string. Embed it as-is — it is WCAG-accessible; don't strip its
roles/labels/data-table.

## Example

Spec:
```json
{ "type": "bar", "data": { "x": ["Q1","Q2","Q3","Q4"], "y": [45,52,48,61] }, "theme": "tailwind", "title": "Quarterly revenue" }
```
→ returns `<svg …>…</svg>`.
