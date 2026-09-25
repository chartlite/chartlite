---
"@chartlite/react": minor
"@chartlite/vue": minor
"@chartlite/svelte": minor
"@chartlite/element": minor
---

Wrapper polish: stable callbacks, in-place updates, tooltips, ref access, and error recovery.

- All wrappers: a data-only change now calls `chart.update(data)` instead of
  recreating the chart. Function props (`onPointClick`, `onHover`,
  `onLegendToggle`, `valueFormatter`, `onError`, tooltip `formatter`) are called
  through stable proxies, so inline callbacks no longer recreate the chart.
  `plugins` are compared by name.
- All wrappers: new `tooltip?: boolean | TooltipOptions` option. `onPointClick` /
  `onHover` automatically install `callbacks()`, and `onLegendToggle` installs
  `legendToggle()`, unless a plugin with that name is already present.
- All wrappers: the error fallback renders inside the chart container, so a chart
  recovers as soon as valid input arrives.
- React: components forward refs (`{ chart, container, error, toSVG() }`),
  pass through `id`, `className`, `style`, `aria-*` and `data-*`, and the
  build ships a `'use client'` directive. The generic `<Chart>` props are a
  discriminated union on `type`.
- Vue: every chart option is a declared, typed prop (kebab-case and boolean
  shorthand work, including for undeclared attributes). Template refs expose
  `{ chart, error, container, toSVG() }`.
- Svelte: `ChartParams` is a discriminated union on `type`, and the action
  exposes the live `chart`.
- Element: new `tooltip` boolean attribute. Malformed JSON in `spec` or `data`
  now reports an error that names the attribute, via `chartlite:error` and
  `console.error`.
- `@chartlite/core` is now a `workspace:^` dependency.
