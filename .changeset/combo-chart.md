---
"@chartlite/core": minor
"@chartlite/mcp": minor
---

Add the combo chart (mix bars, lines and areas on one set of axes)

`ComboChart` renders each series by its own type on a shared categorical x-axis
and linear y-axis, so the classic "bars + trend line" is a first-class chart:

```ts
new ComboChart('#chart', {
  data: {
    series: [
      { name: 'Revenue', dataKey: 'revenue', type: 'bar' },
      { name: 'Growth',  dataKey: 'growth',  type: 'line' },
    ],
    data: [{ month: 'Jan', revenue: 100, growth: 20 }, /* … */],
  },
}).render();
```

- Bars are grouped side-by-side among the bar series; area and line series are
  drawn on top. Series without a `type` fall back to `defaultType` (default `bar`).
- Per-series `type` now flows through data normalization (`SeriesData` carries
  `type`, sourced from the series-first `SeriesDefinition.type`).
- Full parity with the other charts: shared legend/axes, the `data-*` interactivity
  contract, ARIA labels + keyboard nav, CSS-variable theming, and SSR — `combo`
  is registered in `renderToString`, the `ChartSpec` schema, and the
  `@chartlite/mcp` `render_chart` tool.
