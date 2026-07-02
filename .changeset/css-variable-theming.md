---
"@chartlite/core": minor
---

Add opt-in CSS-variable theming (`cssVars`)

Set `cssVars: true` on any chart to publish the theme as CSS custom properties
(`--cl-bg`, `--cl-fg`, `--cl-text`, `--cl-grid`, `--cl-primary`, `--cl-series-0..N`)
on the SVG root and render every color as `var(--cl-*, <fallback>)`. The chart
then becomes fully re-themeable with plain CSS — including dark mode via
`@media (prefers-color-scheme: dark)` — with **no JavaScript**.

This pairs with server-side rendering: `renderToString({ ...spec, cssVars: true })`
produces a themeable SVG you can drop into a page and restyle entirely in CSS, so
light/dark theming needs zero client runtime. The option is exposed in the
`ChartSpec` schema, so it also works through the `@chartlite/mcp` server.

Default is `false`, so existing output is unchanged.
