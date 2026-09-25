# @chartlite/svelte

## 1.1.0

### Minor Changes

- [#44](https://github.com/chartlite/chartlite/pull/44) [`3f361b7`](https://github.com/chartlite/chartlite/commit/3f361b7418b2749a1996b6ee229c7514d8130755) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Wrapper polish: stable callbacks, in-place updates, tooltips, ref access, and error recovery.

  - All wrappers: a data-only change now calls `chart.update(data)` instead of
    recreating the chart. Function props (`onPointClick`, `onHover`,
    `onLegendToggle`, `valueFormatter`, `onError`, tooltip `formatter`) are called
    through stable proxies, so inline callbacks no longer recreate the chart.
    `plugins` are compared by name.
  - All wrappers: new `tooltip?: boolean | TooltipOptions` option. `onPointClick` /
    `onHover` automatically install `callbacks()`, and `onLegendToggle` installs
    `legendToggle()`, unless a plugin with that name is already present.
  - All wrappers: the error fallback renders inside the chart container, so a chart
    recovers as soon as valid input arrives.
  - React: components forward refs (`{ chart, container, error, toSVG() }`),
    pass through `id`, `className`, `style`, `aria-*` and `data-*`, and the
    build ships a `'use client'` directive. The generic `<Chart>` props are a
    discriminated union on `type`.
  - Vue: every chart option is a declared, typed prop (kebab-case and boolean
    shorthand work, including for undeclared attributes). Template refs expose
    `{ chart, error, container, toSVG() }`.
  - Svelte: `ChartParams` is a discriminated union on `type`, and the action
    exposes the live `chart`.
  - Element: new `tooltip` boolean attribute. Malformed JSON in `spec` or `data`
    now reports an error that names the attribute, via `chartlite:error` and
    `console.error`.
  - `@chartlite/core` is now a `workspace:^` dependency.

### Patch Changes

- Updated dependencies [[`3f361b7`](https://github.com/chartlite/chartlite/commit/3f361b7418b2749a1996b6ee229c7514d8130755), [`3ee1a08`](https://github.com/chartlite/chartlite/commit/3ee1a08dd440199410b8b1f60b509020a2b612fe), [`3ee1a08`](https://github.com/chartlite/chartlite/commit/3ee1a08dd440199410b8b1f60b509020a2b612fe)]:
  - @chartlite/core@1.1.0

## 1.0.1

### Patch Changes

- [`020fb4a`](https://github.com/chartlite/chartlite/commit/020fb4aa20b69a234c2491e9adc5607538192d6b) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Fix negative and flat-value rendering, refresh accessibility metadata on updates, harden SSR and runtime data validation, and restore keyboard interaction parity. Reduce the core install and gzip size, make wrapper imports tree-shakeable, repair performance and bundle checks, and update vulnerable dependencies.

- Updated dependencies [[`020fb4a`](https://github.com/chartlite/chartlite/commit/020fb4aa20b69a234c2491e9adc5607538192d6b)]:
  - @chartlite/core@1.0.1

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
