---
"@chartlite/core": minor
---

Add three theme presets: **tailwind**, **nord**, and **high-contrast**. These were
advertised in the docs but weren't actually implemented — this makes them real, each
with an 8-colour series palette. `high-contrast` is tuned for accessibility (visible
gridlines, high-contrast series colours). The `Theme` type is widened accordingly.
