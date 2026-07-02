# @chartlite/core

## 0.8.0

### Minor Changes

- [#18](https://github.com/chartlite/chartlite/pull/18) [`76887d6`](https://github.com/chartlite/chartlite/commit/76887d6f930bc1030b38e8e0ef0f947abcdb3296) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add server-side rendering at `@chartlite/core/server` — headless, zero-JS charts.

  - **`renderToString(spec)`** turns a declarative `ChartSpec` into an SVG string in
    Node/Bun/edge with **no browser and no jsdom**, via a ~200-line zero-dependency
    SVG DOM shim (installed only when no real DOM is present, restored after each
    synchronous render). Output is equivalent whether it runs headless or in a browser.
  - **`ChartSpec`** — a single `{ type, data, ...options }` JSON object (the payload
    agents and templates emit, and the input the upcoming MCP server will take).
  - **Published `schema.json`** (draft 2020-12) for `ChartSpec`, exported as
    `@chartlite/core/schema.json` and as `chartSpecSchema` from `/server`. A test keeps
    it in sync with the code and asserts the `type` enum matches the render registry.

  ```ts
  import { renderToString } from "@chartlite/core/server";
  const svg = renderToString({
    type: "line",
    data: [1, 2, 3],
    theme: "tailwind",
  });
  ```

  Ships as a separate entry point — the default `@chartlite/core` bundle is unchanged.

## 0.7.0

### Minor Changes

- [#16](https://github.com/chartlite/chartlite/pull/16) [`ae80a8b`](https://github.com/chartlite/chartlite/commit/ae80a8bfac040c284049deaeb652b7f75629ff0c) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add a tree-shakeable interactivity layer at `@chartlite/core/interactive`.

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

## 0.6.0

### Minor Changes

- [#14](https://github.com/chartlite/chartlite/pull/14) [`df04cbe`](https://github.com/chartlite/chartlite/commit/df04cbe00c7618eb9c8be8e8e5ccba80fde8455e) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add **value formatters** for axis labels. A new `valueFormatter?: (value: number) =>
string` config option formats numeric axis ticks, plus a set of tree-shakeable built-ins
  exported as `formatters` (and individually): `abbreviate` (1.5K / 2.3M), `currency`,
  `percent`, and `number` — all `Intl`-based and locale-aware. This is what makes charts
  usable with real-world currency/percentage/large-number data.

- [#13](https://github.com/chartlite/chartlite/pull/13) [`1343f7e`](https://github.com/chartlite/chartlite/commit/1343f7e52cdcbfb900e9e18777d1f941c02552e7) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add **Sparkline** — a tiny, axis-less inline chart for the "live metric on a landing
  page" use case. Strips axes/title/legend/margins and draws just the data shape (line or
  filled `area`), with an optional dot on the latest point (`showEndDot`), `linear`/`smooth`
  curves, and a small default size. Handles flat series and single-point data.

## 0.5.0

### Minor Changes

- [#11](https://github.com/chartlite/chartlite/pull/11) [`c1914a1`](https://github.com/chartlite/chartlite/commit/c1914a126d4a59d1287c99e8bed5811d640fbc38) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add three theme presets: **tailwind**, **nord**, and **high-contrast**. These were
  advertised in the docs but weren't actually implemented — this makes them real, each
  with an 8-colour series palette. `high-contrast` is tuned for accessibility (visible
  gridlines, high-contrast series colours). The `Theme` type is widened accordingly.

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
