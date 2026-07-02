---
"@chartlite/core": minor
"@chartlite/react": minor
---

Add stacked bar charts via a `stacked` option on `BarChart` (works for both
vertical and horizontal orientations, multi-series only). Bars for a category
stack on a shared axis position and the value axis scales to per-category totals.

```ts
new BarChart('#chart', {
  data: { series: [{ name: 'A', dataKey: 'a' }, { name: 'B', dataKey: 'b' }],
          data: [{ x: 'Q1', a: 10, b: 5 }, { x: 'Q2', a: 20, b: 5 }] },
  stacked: true,
}).render();
```

The CI gzipped-bundle ceiling was raised from 15 KB to a deliberate 20 KB to make
room for the full core chart-type set while staying an order of magnitude smaller
than Recharts/Chart.js/ECharts. Core is ~15 KB gzipped today.
