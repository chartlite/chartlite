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

## Tooltips and interactivity

Add the `tooltip` boolean attribute (or `tooltip: true` / a
[`TooltipOptions`](https://github.com/chartlite/chartlite/blob/main/packages/core/src/interactive/tooltip.ts)
object in `spec`) for a hover tooltip:

```html
<chart-lite type="line" data="[4200, 4800, 5200]" tooltip></chart-lite>
```

Callbacks in a JS `spec` install the plugins they need automatically:
`onPointClick` / `onHover` add `callbacks()`, `onLegendToggle` adds
`legendToggle()` (unless a plugin with that name is already in `spec.plugins`).

```js
el.spec = { type: 'bar', data, onPointClick: (p) => console.log(p.x, p.y) };
```

## Updates

Setting a new `spec` (or changing an attribute) is diffed against the current
chart: a change to `data` alone updates the chart in place (`chart.update`),
new callback functions are picked up without re-rendering, and any other change
recreates the chart. Changes made in the same tick are coalesced into one update.

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
- `chartlite:error` — fired if the chart throws (`detail` is the `Error`); a fallback box is shown in the element, and the chart recovers once valid input arrives.

A malformed JSON `spec` or `data` attribute is reported the same way, with a
message naming the attribute (e.g. `<chart-lite>: the "data" attribute is not
valid JSON (…)`), and is also logged with `console.error`.

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
