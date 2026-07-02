# @chartlite/core

## 0.12.1

### Patch Changes

- [#35](https://github.com/chartlite/chartlite/pull/35) [`1d657c0`](https://github.com/chartlite/chartlite/commit/1d657c0b36ba42b0ca80601d0b787b915cd02073) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Fix `cssVars`: theme tokens are now overridable from an ancestor

  Previously, enabling `cssVars` also wrote the `--cl-*` tokens as inline styles on
  the SVG element itself. Those inline values won over any `--cl-*` set on a parent
  (`:root`, a wrapper, a dark-mode media query), so external CSS theming silently
  did nothing — the chart always used its own values.

  Now the chart only emits colors as `var(--cl-*, <fallback>)` and does **not** pin
  the tokens on the SVG. The fallback is the default, and an ancestor can override
  any token through the normal CSS cascade — so palette swaps, global dark-mode
  toggles, and `@media (prefers-color-scheme: dark)` on the SSR output all work as
  documented.

## 0.12.0

## 0.11.0

### Minor Changes

- [#28](https://github.com/chartlite/chartlite/pull/28) [`57c2272`](https://github.com/chartlite/chartlite/commit/57c22724a09f336356b6eacffc70c550bc89c67b) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add the combo chart (mix bars, lines and areas on one set of axes)

  `ComboChart` renders each series by its own type on a shared categorical x-axis
  and linear y-axis, so the classic "bars + trend line" is a first-class chart:

  ```ts
  new ComboChart("#chart", {
    data: {
      series: [
        { name: "Revenue", dataKey: "revenue", type: "bar" },
        { name: "Growth", dataKey: "growth", type: "line" },
      ],
      data: [{ month: "Jan", revenue: 100, growth: 20 } /* … */],
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

## 0.10.0

### Minor Changes

- [#27](https://github.com/chartlite/chartlite/pull/27) [`4107668`](https://github.com/chartlite/chartlite/commit/41076686a984514f91ca9978b7efd0f68da5a56c) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add opt-in CSS-variable theming (`cssVars`)

  Set `cssVars: true` on any chart to publish the theme as CSS custom properties
  (`--cl-bg`, `--cl-fg`, `--cl-text`, `--cl-grid`, `--cl-primary`, `--cl-series-0..N`)
  on the SVG root and render every color as `var(--cl-*, <fallback>)`. The chart
  then becomes fully re-themeable with plain CSS — including dark mode via
  `@media (prefers-color-scheme: dark)` — with **no JavaScript**.

  This pairs with server-side rendering: `renderToString({ ...spec, cssVars: true })`
  produces a themeable SVG you can drop into a page and restyle entirely in CSS, so
  light/dark theming needs zero client runtime. The option is exposed in the
  `ChartSpec` schema, so it also works through the `@chartlite/mcp` server.

  Default is `false`, so existing output is unchanged.

- [#25](https://github.com/chartlite/chartlite/pull/25) [`75d1508`](https://github.com/chartlite/chartlite/commit/75d1508e83a4d9cdfa56a9eea14b98061530d31b) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Polish: gradient area fills + reduced-motion support

  - **Area charts now fill with a vertical gradient by default** — the series color fades from `fillOpacity` at the top to transparent at the bottom, the classic "beautiful area" look. Opt out with `gradient: false` for a flat fill. Each series gets its own `<linearGradient>` with collision-safe ids, and the option is exposed in the `ChartSpec` schema (so it works through SSR and the MCP server).
  - **The entrance animation now respects `prefers-reduced-motion`.** The fade-in is gated behind `@media (prefers-reduced-motion: no-preference)`, so users who ask their OS to reduce motion never see it (WCAG 2.3.3).

## 0.9.0

### Minor Changes

- [#24](https://github.com/chartlite/chartlite/pull/24) [`aa9d477`](https://github.com/chartlite/chartlite/commit/aa9d4773e6ed30236873ba5b49832f37378f17fe) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add `RadialChart` — radial progress rings and gauges. Each data point is drawn as
  a concentric arc over a faint track, filled in proportion to `max` (default 100).
  Set `startAngle`/`endAngle` for a gauge sweep instead of a full ring; single-ring
  charts show the value in the center.

  ```ts
  new RadialChart("#kpi", { data: [{ x: "Score", y: 72 }], max: 100 }).render(); // ring
  new RadialChart("#g", {
    data: [{ x: "Speed", y: 60 }],
    startAngle: -90,
    endAngle: 90,
  }); // gauge
  ```

  `radial` is also available from `renderToString` / the `render_chart` MCP tool and
  is included in the published chart-spec schema.

- [#22](https://github.com/chartlite/chartlite/pull/22) [`244905d`](https://github.com/chartlite/chartlite/commit/244905d4d775d3e45ef080f33c456b825af8a5d0) Thanks [@CanadaApollo6](https://github.com/CanadaApollo6)! - Add stacked bar charts via a `stacked` option on `BarChart` (works for both
  vertical and horizontal orientations, multi-series only). Bars for a category
  stack on a shared axis position and the value axis scales to per-category totals.

  ```ts
  new BarChart("#chart", {
    data: {
      series: [
        { name: "A", dataKey: "a" },
        { name: "B", dataKey: "b" },
      ],
      data: [
        { x: "Q1", a: 10, b: 5 },
        { x: "Q2", a: 20, b: 5 },
      ],
    },
    stacked: true,
  }).render();
  ```

  The CI gzipped-bundle ceiling was raised from 15 KB to a deliberate 20 KB to make
  room for the full core chart-type set while staying an order of magnitude smaller
  than Recharts/Chart.js/ECharts. Core is ~15 KB gzipped today.

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
