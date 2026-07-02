---
"@chartlite/core": patch
---

Fix `cssVars`: theme tokens are now overridable from an ancestor

Previously, enabling `cssVars` also wrote the `--cl-*` tokens as inline styles on
the SVG element itself. Those inline values won over any `--cl-*` set on a parent
(`:root`, a wrapper, a dark-mode media query), so external CSS theming silently
did nothing — the chart always used its own values.

Now the chart only emits colors as `var(--cl-*, <fallback>)` and does **not** pin
the tokens on the SVG. The fallback is the default, and an ancestor can override
any token through the normal CSS cascade — so palette swaps, global dark-mode
toggles, and `@media (prefers-color-scheme: dark)` on the SSR output all work as
documented.
