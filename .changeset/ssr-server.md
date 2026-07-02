---
"@chartlite/core": minor
"@chartlite/react": minor
---

Add server-side rendering at `@chartlite/core/server` — headless, zero-JS charts.

- **`renderToString(spec)`** turns a declarative `ChartSpec` into an SVG string in
  Node/Bun/edge with **no browser and no jsdom**, via a ~200-line zero-dependency
  SVG DOM shim (installed only when no real DOM is present, restored after each
  synchronous render). Output is equivalent whether it runs headless or in a browser.
- **`ChartSpec`** — a single `{ type, data, ...options }` JSON object (the payload
  agents and templates emit, and the input the upcoming MCP server will take).
- **Published `schema.json`** (draft 2020-12) for `ChartSpec`, exported as
  `@chartlite/core/schema.json` and as `chartSpecSchema` from `/server`. A test keeps
  it in sync with the code and asserts the `type` enum matches the render registry.

```ts
import { renderToString } from '@chartlite/core/server';
const svg = renderToString({ type: 'line', data: [1, 2, 3], theme: 'tailwind' });
```

Ships as a separate entry point — the default `@chartlite/core` bundle is unchanged.
