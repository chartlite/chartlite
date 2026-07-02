# @chartlite/core

## 0.4.0

### Minor Changes

- [`3bde49c`](https://github.com/chartlite/chartlite/commit/3bde49ca2824217d5d458b59ac207a451769fda1) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add **PieChart** (pie and donut). Renders a single series as angular slices with
  per-slice accessibility (focusable `.data-point` elements + ARIA labels), optional
  donut mode via `innerRadius`, and optional percentage labels via `showLabels`. This
  implements the previously-declared `PieChartConfig` type, closing a long-standing gap
  between the public types and the runtime.

## 0.3.0

### Minor Changes

- [#2](https://github.com/chartlite/chartlite/pull/2) [`13ec79a`](https://github.com/chartlite/chartlite/commit/13ec79ac922c259cfe5584264717511313bf7751) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Publish the feature work that had landed on the development branch but was never
  released: the Scatter chart type, the multi-series data support with configurable
  legend, the plugin system (tooltip + debug), full accessibility (ARIA, keyboard
  navigation, screen-reader data-table fallback), and chart overlays (reference lines,
  annotations, region highlighting). Combined with the 0.3.0 foundation work, this is the
  first honest, feature-complete-for-its-scope release.

### Patch Changes

- [#1](https://github.com/chartlite/chartlite/pull/1) [`ac6e77a`](https://github.com/chartlite/chartlite/commit/ac6e77a1e92d9fd90bc1d5a4991899728ef20a57) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Build & release tooling: the `VERSION` constant is now derived from `package.json` at
  build time (single source of truth) instead of being hand-maintained, and releases are
  now managed with [Changesets](https://github.com/changesets/changesets). No public API or
  runtime behavior changes.
