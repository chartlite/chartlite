---
"@chartlite/core": minor
"@chartlite/react": minor
---

Add a tree-shakeable interactivity layer at `@chartlite/core/interactive`.

New opt-in plugin factories, none of which touch the default `@chartlite/core`
bundle unless imported:

- `tooltip()` — hover tooltips (replaces the now-deprecated `TooltipPlugin`, whose
  selector no longer matched the rendered points)
- `crosshair()` — focus guide line for line/area/scatter charts
- `legendToggle()` — click a legend item to show/hide its series
- `callbacks()` — wires `onPointClick` / `onHover` to data points
- `interactive()` — convenience bundler for the above

To support these, every chart now emits a stable `data-*` contract on its
`.data-point` elements (`data-x`, `data-y`, `data-series`, `data-series-index`,
`data-index`, and pixel centres `data-cx`/`data-cy`), series-level shapes carry
`data-series-index`, and legend items are tagged `.legend-item[data-series-index]`.
New optional config callbacks `onPointClick`, `onHover`, and `onLegendToggle` (with
`ChartPointEvent` / `LegendToggleEvent` types) are exported from core.

`TooltipPlugin` from `@chartlite/core` is deprecated in favor of `tooltip()` and
will be removed in 1.0.
