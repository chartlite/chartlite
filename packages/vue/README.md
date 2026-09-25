# @chartlite/vue

**Vue 3 components for Chartlite — beautiful, lightweight charts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Thin Vue 3 wrapper over [`@chartlite/core`](https://www.npmjs.com/package/@chartlite/core) — a ~15KB-gzip, zero-dependency SVG charting library. Same charts, same API, idiomatic Vue.

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
  <!-- or spread a whole spec -->
  <Chart v-bind="spec" />
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

## Props

Every chart option is a typed prop, so Volar autocompletes and type-checks
them, and the usual Vue conventions apply: kebab-case (`:start-angle="-90"`,
`:show-points="false"`) and boolean shorthand (`<LineChart css-vars tooltip />`).
Unset props fall back to the core defaults. Any other attribute is forwarded
too: `class`, `style`, `id`, `aria-*`, `data-*` and undeclared listeners (e.g.
`@click`) land on the container `<div>`; anything else is camelized and passed
to the chart as config.

## Tooltips and events

`tooltip` adds a hover tooltip — use the bare attribute for the defaults or bind
a [`TooltipOptions`](https://github.com/chartlite/chartlite/blob/main/packages/core/src/interactive/tooltip.ts)
object. Event listeners install the plugins they need automatically (unless a
plugin with that name is already in `plugins`): `@point-click` / `@hover` add
`callbacks()`, `@legend-toggle` adds `legendToggle()`.

```vue
<LineChart
  :data="data"
  tooltip
  @point-click="(p) => router.push(`/months/${p.x}`)"
/>

<BarChart :data="multiSeries" :legend="{ show: true }" @legend-toggle="onToggle" />
```

Other plugins (e.g. `crosshair()`) go in `:plugins`. Plugins are compared by
`name`, so an inline `:plugins="[crosshair()]"` doesn't recreate the chart on
every render (changing a plugin's options under the same name therefore needs a
new `key`).

## Reactivity, cleanup, errors

- **Only `data` changed** (including deep changes to reactive data) → the chart
  updates in place with `chart.update(data)`. Data is compared by value.
- **Listener / formatter changed** → nothing re-renders; the chart calls them
  through stable proxies that always invoke the latest function. (A
  `valueFormatter` whose source changes re-renders so axis labels update.)
- **Any other option changed** → the chart is recreated.
- The chart is destroyed on component unmount.
- Listen with `@error` to catch render errors. A fallback box is shown inside
  the container, and the chart recovers as soon as valid props arrive.

## Template refs

Components expose `{ chart, error, container, toSVG() }`:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { LineChart, type ChartExposed } from '@chartlite/vue';

const chartRef = ref<ChartExposed | null>(null);
const download = () => chartRef.value?.toSVG(); // throws if nothing is rendered
</script>

<template>
  <LineChart ref="chartRef" :data="data" />
</template>
```

## Themes (incl. zero-JS dark mode)

Six built-in themes (`default`, `midnight`, `minimal`, `tailwind`, `nord`, `high-contrast`). Or pass `cssVars` and re-theme with plain CSS:

```vue
<LineChart :data="data" css-vars class="chart" />
```

```css
@media (prefers-color-scheme: dark) {
  .chart { --cl-text: #94a3b8; --cl-grid: #1e293b; --cl-series-0: #818cf8; }
}
```

## License

MIT © [Riel St. Amand](https://github.com/chartlite)
