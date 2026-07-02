---
"@chartlite/core": minor
---

Add **PieChart** (pie and donut). Renders a single series as angular slices with
per-slice accessibility (focusable `.data-point` elements + ARIA labels), optional
donut mode via `innerRadius`, and optional percentage labels via `showLabels`. This
implements the previously-declared `PieChartConfig` type, closing a long-standing gap
between the public types and the runtime.
