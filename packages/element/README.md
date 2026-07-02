# @chartlite/element

**The `<chart-lite>` web component — Chartlite anywhere, no framework required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A standard custom element wrapping [`@chartlite/core`](https://www.npmjs.com/package/@chartlite/core). Works in plain HTML, Astro/Hugo/11ty, and every framework — including **Angular**.

## Installation

```bash
pnpm add @chartlite/element @chartlite/core
```

Importing the package registers `<chart-lite>`:

```js
import '@chartlite/element';
```

## Plain HTML

Pass a spec as attributes (`data` is JSON):

```html
<chart-lite
  type="bar"
  data="[45000, 52000, 48000, 61000]"
  theme="tailwind"
  title="Quarterly Sales">
</chart-lite>

<script type="module">
  import '@chartlite/element';
</script>
```

Or set the full spec as a JS property (best for rich/dynamic data):

```js
const el = document.querySelector('chart-lite');
el.spec = {
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
};
```

All eight chart types are supported: `line`, `bar`, `area`, `scatter`, `pie`/donut, `radial`/gauge, `combo`, `sparkline`.

## Angular

Register the schema, then bind the `spec` property:

```ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@chartlite/element';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<chart-lite [spec]="chartSpec"></chart-lite>`,
})
export class DashboardComponent {
  chartSpec = { type: 'line', data: this.revenue, theme: 'tailwind' };
}
```

## Events

- `chartlite:render` — fired after a successful render (`detail.type`).
- `chartlite:error` — fired if the chart throws (`detail` is the `Error`); a fallback box is shown in the element.

## Custom tag name

```js
import { defineChartElement } from '@chartlite/element';
defineChartElement('my-chart'); // instead of the auto-registered <chart-lite>
```

## Theming (incl. zero-JS dark mode)

Six built-in themes, or add the `css-vars` attribute and re-theme with plain CSS:

```html
<chart-lite type="line" data="[1,2,3,2,4]" css-vars class="chart"></chart-lite>

<style>
  @media (prefers-color-scheme: dark) {
    .chart { --cl-text: #94a3b8; --cl-grid: #1e293b; --cl-series-0: #818cf8; }
  }
</style>
```

## License

MIT © [Riel St. Amand](https://github.com/chartlite)
