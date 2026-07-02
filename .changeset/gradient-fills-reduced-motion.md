---
"@chartlite/core": minor
---

Polish: gradient area fills + reduced-motion support

- **Area charts now fill with a vertical gradient by default** — the series color fades from `fillOpacity` at the top to transparent at the bottom, the classic "beautiful area" look. Opt out with `gradient: false` for a flat fill. Each series gets its own `<linearGradient>` with collision-safe ids, and the option is exposed in the `ChartSpec` schema (so it works through SSR and the MCP server).
- **The entrance animation now respects `prefers-reduced-motion`.** The fade-in is gated behind `@media (prefers-reduced-motion: no-preference)`, so users who ask their OS to reduce motion never see it (WCAG 2.3.3).
