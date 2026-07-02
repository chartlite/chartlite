# @chartlite/react

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

### Patch Changes

- Updated dependencies [[`aa9d477`](https://github.com/chartlite/chartlite/commit/aa9d4773e6ed30236873ba5b49832f37378f17fe), [`244905d`](https://github.com/chartlite/chartlite/commit/244905d4d775d3e45ef080f33c456b825af8a5d0)]:
  - @chartlite/core@0.9.0

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

### Patch Changes

- Updated dependencies [[`76887d6`](https://github.com/chartlite/chartlite/commit/76887d6f930bc1030b38e8e0ef0f947abcdb3296)]:
  - @chartlite/core@0.8.0

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

### Patch Changes

- Updated dependencies [[`ae80a8b`](https://github.com/chartlite/chartlite/commit/ae80a8bfac040c284049deaeb652b7f75629ff0c)]:
  - @chartlite/core@0.7.0

## 0.6.0

### Patch Changes

- Updated dependencies [[`df04cbe`](https://github.com/chartlite/chartlite/commit/df04cbe00c7618eb9c8be8e8e5ccba80fde8455e), [`1343f7e`](https://github.com/chartlite/chartlite/commit/1343f7e52cdcbfb900e9e18777d1f941c02552e7)]:
  - @chartlite/core@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies [[`c1914a1`](https://github.com/chartlite/chartlite/commit/c1914a126d4a59d1287c99e8bed5811d640fbc38)]:
  - @chartlite/core@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies [[`3bde49c`](https://github.com/chartlite/chartlite/commit/3bde49ca2824217d5d458b59ac207a451769fda1)]:
  - @chartlite/core@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies [[`ac6e77a`](https://github.com/chartlite/chartlite/commit/ac6e77a1e92d9fd90bc1d5a4991899728ef20a57), [`13ec79a`](https://github.com/chartlite/chartlite/commit/13ec79ac922c259cfe5584264717511313bf7751)]:
  - @chartlite/core@0.3.0
