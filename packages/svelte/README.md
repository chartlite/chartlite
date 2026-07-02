# @chartlite/svelte

**A Svelte action for Chartlite — beautiful, lightweight charts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Thin Svelte wrapper over [`@chartlite/core`](https://www.npmjs.com/package/@chartlite/core) — a ~13KB-gzip, zero-dependency SVG charting library. Shipped as a Svelte **action**, so it needs no Svelte compiler and works across Svelte 3, 4, and 5.

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

The action **recreates** the chart whenever the parameters change (Svelte calls `update`), and **destroys** it when the element unmounts. All eight chart types work: `line`, `bar`, `area`, `scatter`, `pie`/donut, `radial`/gauge, `combo` (bars + trend line), and `sparkline`.

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

Pass `onError` to catch render errors; otherwise a fallback box is shown in the host element:

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
