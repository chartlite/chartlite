# @chartlite/svelte

## 1.0.0

### Major Changes

- [#38](https://github.com/chartlite/chartlite/pull/38) [`fd806ab`](https://github.com/chartlite/chartlite/commit/fd806ab54bb720d0ca2b7413912b8d2fa1bf12d0) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - # 1.0.0 — stable API

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

### Patch Changes

- Updated dependencies [[`fd806ab`](https://github.com/chartlite/chartlite/commit/fd806ab54bb720d0ca2b7413912b8d2fa1bf12d0)]:
  - @chartlite/core@1.0.0

## 0.12.1

### Patch Changes

- Updated dependencies [[`1d657c0`](https://github.com/chartlite/chartlite/commit/1d657c0b36ba42b0ca80601d0b787b915cd02073)]:
  - @chartlite/core@0.12.1
