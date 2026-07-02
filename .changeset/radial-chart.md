---
"@chartlite/core": minor
"@chartlite/react": minor
"@chartlite/mcp": minor
---

Add `RadialChart` — radial progress rings and gauges. Each data point is drawn as
a concentric arc over a faint track, filled in proportion to `max` (default 100).
Set `startAngle`/`endAngle` for a gauge sweep instead of a full ring; single-ring
charts show the value in the center.

```ts
new RadialChart('#kpi', { data: [{ x: 'Score', y: 72 }], max: 100 }).render();      // ring
new RadialChart('#g', { data: [{ x: 'Speed', y: 60 }], startAngle: -90, endAngle: 90 }); // gauge
```

`radial` is also available from `renderToString` / the `render_chart` MCP tool and
is included in the published chart-spec schema.
