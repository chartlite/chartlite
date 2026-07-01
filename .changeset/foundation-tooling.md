---
"@chartlite/core": patch
---

Build & release tooling: the `VERSION` constant is now derived from `package.json` at
build time (single source of truth) instead of being hand-maintained, and releases are
now managed with [Changesets](https://github.com/changesets/changesets). No public API or
runtime behavior changes.
