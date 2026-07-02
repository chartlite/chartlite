# @chartlite/vue

**Vue 3 components for Chartlite — beautiful, lightweight charts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Thin Vue 3 wrapper over [`@chartlite/core`](https://www.npmjs.com/package/@chartlite/core) — a ~13KB-gzip, zero-dependency SVG charting library. Same charts, same API, idiomatic Vue.

## Installation

```bash
pnpm add @chartlite/vue @chartlite/core vue
```

## Two ways to use it

**Named components** — when you know the chart type at author time. Each is tree-shakeable:

```vue
<script setup lang="ts">
import { LineChart } from '@chartlite/vue';
const data = [{ x: 'Jan', y: 4200 }, { x: 'Feb', y: 4800 }, { x: 'Mar', y: 5200 }];
</script>

<template>
  <LineChart :data="data" curve="smooth" theme="tailwind" :style="{ height: '360px' }" />
</template>
```

**Generic `<Chart>`** — when the type comes from data (a `ChartSpec` from an agent, CMS, or the `@chartlite/mcp` server). The Vue mirror of the core's `renderToString(spec)`:

```vue
<template>
  <Chart type="combo" :data="spec.data" theme="tailwind" />
</template>
```

All eight chart types work through either API: `line`, `bar`, `area`, `scatter`, `pie`/donut, `radial`/gauge, `combo` (bars + trend line), and `sparkline`.

## Combo chart

```vue
<ComboChart
  :data="{
    series: [
      { name: 'Revenue', dataKey: 'revenue', type: 'bar' },
      { name: 'Growth',  dataKey: 'growth',  type: 'line' },
    ],
    data: [
      { month: 'Jan', revenue: 4200, growth: 12 },
      { month: 'Feb', revenue: 4800, growth: 18 },
    ],
  }"
/>
```

## Reactivity, cleanup, errors

- Charts recreate automatically when their `data`/config props change.
- The chart is destroyed on component unmount.
- Pass `:on-error="fn"` to catch render errors; a fallback box is shown otherwise.

## Themes (incl. zero-JS dark mode)

Six built-in themes (`default`, `midnight`, `minimal`, `tailwind`, `nord`, `high-contrast`). Or pass `cssVars` and re-theme with plain CSS:

```vue
<LineChart :data="data" cssVars class="chart" />
```

```css
@media (prefers-color-scheme: dark) {
  .chart { --cl-text: #94a3b8; --cl-grid: #1e293b; --cl-series-0: #818cf8; }
}
```

## License

MIT © [Riel St. Amand](https://github.com/chartlite)
