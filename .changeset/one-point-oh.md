---
"@chartlite/core": major
"@chartlite/react": major
"@chartlite/vue": major
"@chartlite/svelte": major
"@chartlite/element": major
---

# 1.0.0 — stable API

Chartlite's public API is now frozen and follows semantic versioning. This release
audits and tightens the surface across every package.

## Breaking changes

- **Removed the deprecated `showLegend` option.** Use `legend: { show: true }` instead
  (available since multi-series support landed).
- **Removed the deprecated `TooltipPlugin` class.** Use the tree-shakeable `tooltip()`
  action from `@chartlite/core/interactive`:
  `import { tooltip } from '@chartlite/core/interactive'; new LineChart(el, { plugins: [tooltip()] })`.

## Improvements

- **Complete, consistent type exports.** `@chartlite/element` now re-exports the full
  config/event type set (`LegendPosition`, `LegendAlign`, `LegendConfig`, `ReferenceLine`,
  `Annotation`, `Region`, `ChartPointEvent`, `LegendToggleEvent`), matching the other
  wrappers. `LegendAlign` is now exported from `@chartlite/react`, `@chartlite/vue`, and
  `@chartlite/svelte` as well.
- **Fuller, accurate chart-spec JSON Schema.** Added `animate`, `responsive`,
  `legend.layout`, the `referenceLines` / `annotations` / `regions` overlays, and the
  per-chart options `trackColor` (radial), `showEndDot` / `strokeWidth` (sparkline), and
  `labelOffset` / `labelPosition` (scatter). Fixes `legend.layout` being falsely rejected
  by the published `schema.json`.
