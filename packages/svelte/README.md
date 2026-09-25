# @chartlite/svelte

**A Svelte action for Chartlite — beautiful, lightweight charts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Thin Svelte wrapper over [`@chartlite/core`](https://www.npmjs.com/package/@chartlite/core) — a ~15KB-gzip, zero-dependency SVG charting library. Shipped as a Svelte **action** and supports Svelte 4 and 5.

## Installation

```bash
pnpm add @chartlite/svelte @chartlite/core svelte
```

## Usage

Attach the `chart` action to any element and pass a spec — the Svelte mirror of the core's `renderToString(spec)`:

```svelte
<script>
  import { chart } from '@chartlite/svelte';

  let data = [
    { x: 'Jan', y: 4200 },
    { x: 'Feb', y: 4800 },
    { x: 'Mar', y: 5200 },
  ];
</script>

<div use:chart={{ type: 'line', data, curve: 'smooth', theme: 'tailwind' }} style="height: 360px" />
```

All eight chart types work: `line`, `bar`, `area`, `scatter`, `pie`/donut, `radial`/gauge, `combo` (bars + trend line), and `sparkline`. The parameters are typed as a discriminated union on `type` (`ChartParams`), so each `type` only accepts its own chart's options — `{ type: 'line', curv: 'smooth' }` is a type error.

### Updates

When the parameters change (Svelte calls the action's `update`), the action diffs them:

- **Only `data` changed** → the chart updates in place with `chart.update(data)`. Data is compared by value, so an equal-but-new array is a no-op.
- **Callbacks changed** (`onPointClick`, `onHover`, `onLegendToggle`, `onError`, `valueFormatter`, `tooltip.formatter`) → nothing re-renders; the chart calls them through stable proxies that always invoke the latest function, so inline arrow functions are fine. (A `valueFormatter` whose source changes re-renders so axis labels update.)
- **Any other option changed** → the chart is recreated.

The chart is **destroyed** when the element unmounts. If you call the action yourself, its return value also exposes the live core instance as `chart` (or `null` after an error).

### Tooltips and interactivity

`tooltip: true` (or a [`TooltipOptions`](https://github.com/chartlite/chartlite/blob/main/packages/core/src/interactive/tooltip.ts) object) adds a hover tooltip. Event callbacks install the plugins they need automatically (unless a plugin with that name is already in `plugins`): `onPointClick` / `onHover` add `callbacks()`, `onLegendToggle` adds `legendToggle()`.

```svelte
<div use:chart={{
  type: 'line',
  data,
  tooltip: true,
  onPointClick: (p) => goto(`/months/${p.x}`),
}} />
```

Other plugins (e.g. `crosshair()`) go in `plugins`; they're compared by `name`, so an inline `plugins: [crosshair()]` doesn't recreate the chart on every update.

### Combo chart

```svelte
<div use:chart={{
  type: 'combo',
  data: {
    series: [
      { name: 'Revenue', dataKey: 'revenue', type: 'bar' },
      { name: 'Growth',  dataKey: 'growth',  type: 'line' },
    ],
    data: [
      { month: 'Jan', revenue: 4200, growth: 12 },
      { month: 'Feb', revenue: 4800, growth: 18 },
    ],
  },
}} />
```

### Errors

Pass `onError` to catch render errors. A fallback box is shown in the host element either way, and the chart recovers as soon as valid parameters arrive:

```svelte
<div use:chart={{ type: 'line', data, onError: (e) => console.warn(e) }} />
```

## Themes (incl. zero-JS dark mode)

Six built-in themes (`default`, `midnight`, `minimal`, `tailwind`, `nord`, `high-contrast`). Or pass `cssVars: true` and re-theme with plain CSS:

```svelte
<div class="chart" use:chart={{ type: 'line', data, cssVars: true }} />

<style>
  @media (prefers-color-scheme: dark) {
    .chart { --cl-text: #94a3b8; --cl-grid: #1e293b; --cl-series-0: #818cf8; }
  }
</style>
```

## License

MIT © [Riel St. Amand](https://github.com/chartlite)
