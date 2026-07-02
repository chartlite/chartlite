---
"@chartlite/core": minor
---

Add **value formatters** for axis labels. A new `valueFormatter?: (value: number) =>
string` config option formats numeric axis ticks, plus a set of tree-shakeable built-ins
exported as `formatters` (and individually): `abbreviate` (1.5K / 2.3M), `currency`,
`percent`, and `number` — all `Intl`-based and locale-aware. This is what makes charts
usable with real-world currency/percentage/large-number data.
