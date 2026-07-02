# @chartlite/mcp

## 0.3.1

### Patch Changes

- Updated dependencies []:
  - @chartlite/core@0.12.0

## 0.3.0

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

### Patch Changes

- Updated dependencies [[`57c2272`](https://github.com/chartlite/chartlite/commit/57c22724a09f336356b6eacffc70c550bc89c67b)]:
  - @chartlite/core@0.11.0

## 0.2.1

### Patch Changes

- Updated dependencies [[`4107668`](https://github.com/chartlite/chartlite/commit/41076686a984514f91ca9978b7efd0f68da5a56c), [`75d1508`](https://github.com/chartlite/chartlite/commit/75d1508e83a4d9cdfa56a9eea14b98061530d31b)]:
  - @chartlite/core@0.10.0

## 0.2.0

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

### Patch Changes

- Updated dependencies [[`aa9d477`](https://github.com/chartlite/chartlite/commit/aa9d4773e6ed30236873ba5b49832f37378f17fe), [`244905d`](https://github.com/chartlite/chartlite/commit/244905d4d775d3e45ef080f33c456b825af8a5d0)]:
  - @chartlite/core@0.9.0
