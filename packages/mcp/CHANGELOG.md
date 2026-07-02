# @chartlite/mcp

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
