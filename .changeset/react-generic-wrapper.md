---
"@chartlite/react": minor
---

Rework the React wrapper: generic `<Chart>` + all chart types

- **New generic `<Chart type=… {...config} />`** — the React mirror of the core's
  `renderToString(spec)`. Pass a `ChartSpec`-shaped object (from an agent, CMS, or
  the `@chartlite/mcp` server) and it renders. Covers every chart type.
- **Named components now cover all eight types**, not just four: adds
  `PieChart`, `RadialChart`, `ComboChart`, and `Sparkline` alongside `LineChart`,
  `BarChart`, `AreaChart`, `ScatterChart`. Each named component imports only its
  own core class, so they stay tree-shakeable.
- Both APIs share one mount/render/cleanup path (`useChart`), which recreates the
  chart when the serializable config changes and destroys it on unmount, with an
  error-boundary fallback + `onError`.
- Full typing re-exported from core (including `ComboChartConfig`,
  `RadialChartConfig`, `SparklineConfig`, `ChartPointEvent`).

New chart types and options (combo, radial, `cssVars` theming, gradients) are now
reachable from React.
