# Design: the critical path to 1.0

**Status:** decisions locked — Decision 1 = **DOM shim in `/server`**, Decision 2 = **plugin
factories in `/interactive`** (both confirmed 2026-07). Executing.
**Companion to:** [V1_ROADMAP.md](V1_ROADMAP.md), which sets the *what/why/order*. This doc
pins down the *how* for the four hard, architecture-defining pieces: SSR, the declarative
spec, interactivity, and agent tooling. Breadth (stacked/combo/radial), theming polish, and
the Vue wrapper are comparatively mechanical and are not detailed here.

Current baseline: `0.6.0` published, 390 tests, **14.7 KB gzipped** against a **15 KB** CI
gate. The dominant non-functional constraint below is that gate: **every new feature must be
tree-shakeable out of the default entry**, or it doesn't ship in core.

---

## The one constraint that shapes everything: package/entry layout

We keep a single versioned `@chartlite/core` package with **subpath exports**, plus one new
standalone package for the MCP server. Subpaths are independent entry points esbuild/Vite
tree-shake separately, so importing `@chartlite/core` never pulls in SSR or interactivity
bytes.

```
@chartlite/core                 # charts + DOM rendering (today's 14.7 KB) — unchanged
@chartlite/core/interactive     # tooltips, crosshair, legend-toggle, callbacks
@chartlite/core/server          # renderToString + declarative renderChart (Node/edge, no DOM)
@chartlite/core/schema.json     # published JSON Schema for the chart spec
@chartlite/mcp                  # standalone: MCP server (has its own deps + bin)  — new package
```

Why subpaths for interactive/server but a separate package for MCP: interactive/server share
Chartlite's types and must version in lockstep (already in the Changesets `fixed` group), and
carry zero third-party deps. `@chartlite/mcp` pulls the MCP SDK and ships a CLI `bin`, so it
earns its own package (and its own dependency surface that we don't want anywhere near core).

The core `package.json` gains an `exports` map and `sideEffects: false` (it's already
effectively side-effect-free) so bundlers can prove the tree-shaking.

---

## Decision 1 — how SSR renders without a DOM

`renderToString(spec)` must produce SVG in Node/Bun/edge where `document` doesn't exist. Two
ways to get there from today's imperative-DOM code:

### Option A (recommended): SVG DOM shim in `/server`
A ~150-line zero-dep implementation of the tiny DOM subset our render code actually uses
(`createElementNS`, `createElement`, `setAttribute`, `appendChild`, `textContent`,
`style.setProperty`, `classList`, `querySelector` for the two selectors we use, `innerHTML`
on the data-table `foreignObject`, and `outerHTML` serialization). `renderToString` installs
it as `globalThis.document` for the duration of one **synchronous** render call, then restores
it. Existing chart code runs **completely unchanged**; `toSVG()` already returns `outerHTML`.

- **Pros:** zero churn in core, zero risk to the 390 tests, SSR weight 100% isolated in
  `/server`, ships fast. The shim is the "string adapter" the roadmap called for — just
  realized as a document rather than threaded through every function signature.
- **Cons:** transient `globalThis` swap (safe because render is sync + single-threaded);
  shim must faithfully cover the DOM subset (pinned by a golden-file test: shim output vs
  jsdom output, compared as normalized/parsed SVG, not raw bytes).

### Option B: true VNode renderer abstraction
Rewrite all render modules to build a plain `{tag, attrs, children, text}` tree, with two
serializers (`toDOM`, `toString`). Purest separation; no global swap.

- **Pros:** textbook-clean; no `globalThis` trick; the string path never touches a fake DOM.
- **Cons:** touches **every** render module + all five `renderChart()` implementations; real
  risk of visual drift mid-refactor; larger diff, slower, and changes core internals we just
  stabilized in 0.4.0. Bytes in core could tick up from the VNode indirection.

**Recommendation: Option A.** It gets us verifiable SSR in one focused release with no core
risk, and the golden-file test guards fidelity. Option B is the "right" abstraction on paper
but pays a big refactor cost to avoid a safe, well-contained sync global-swap. If the shim
ever proves too leaky we can graduate to B behind the same `renderToString` API — the public
surface is identical either way.

---

## Decision 2 — how interactivity is delivered

Interactivity must cost static/SSR users **zero bytes**. The plugin system
(`ChartPlugin` + `PluginContext` + `emit/on/off`, already in core) is exactly the seam.

### Option A (recommended): interactivity = plugin factories in `/interactive`
Ship `tooltip()`, `crosshair()`, `legendToggle()` as factory functions returning
`ChartPlugin`s, consumed through the existing `plugins: [...]` array:

```ts
import { LineChart } from '@chartlite/core';
import { tooltip, crosshair, legendToggle } from '@chartlite/core/interactive';

new LineChart(el, {
  data,
  plugins: [tooltip(), crosshair(), legendToggle()],
  onPointClick: (pt) => router.push(pt.href),   // callbacks are plain config, read by the plugins
}).render();
```

- **Pros:** no new core mechanism; provably tree-shaken (unused = not imported); composes
  with user plugins; promotes the existing `TooltipPlugin` rather than duplicating it.
- **Cons:** `plugins: [tooltip()]` is slightly more verbose than a `tooltip: true` flag.

### Option B: config flags (`tooltip: true`) resolved in core
Nicer DX, but core would have to recognize the flags and lazy-import the implementation —
which defeats static tree-shaking and grows core. Rejected for that reason.

**Recommendation: Option A**, with the callbacks (`onPointClick`/`onHover`/`onLegendToggle`)
added to `BaseChartConfig` as optional fields (types are free; they're read by the plugins).
Optionally a one-line convenience `interactive({tooltip, crosshair, legend})` that returns the
bundle of plugins, for people who want one import.

---

## The declarative spec (agent-facing API), given the two decisions

Once `/server` exists, the declarative entry is tiny — a registry over the chart classes:

```ts
// @chartlite/core/server
export function renderChart(spec: ChartSpec): string   // -> SVG string (SSR)
// @chartlite/core (browser)
export function renderChart(el, spec: ChartSpec): Chart // -> mounts + returns instance
```

```jsonc
// ChartSpec — one JSON object; the payload agents/templates emit
{ "type": "line", "data": [...], "theme": "tailwind", "title": "...", "referenceLines": [...] }
```

`ChartSpec` is `{ type: 'line'|'bar'|'area'|'scatter'|'pie'|'sparkline'|... } & <that chart's
config>`. We publish `schema.json` (generated from the TS types in CI so it can't drift) so
any tool can validate a spec. This single object is also exactly the MCP tool's input.

---

## Agent tooling, given the spec

- **`@chartlite/mcp`** — one MCP server exposing `render_chart(spec) -> SVG` (PNG deferred to
  1.x per the backlog). Thin wrapper over `renderChart` from `/server`; the tool's input
  schema *is* the published `schema.json`. Ships a `bin` so `npx @chartlite/mcp` just works.
- **Shipped skill / docs**, authored once: repo-root `AGENTS.md`, a Claude `SKILL.md`, a
  Vercel Eve skill/tool, and `llms.txt` on the docs site — all generated from the same source
  so the API guidance can't drift from the code.

---

## Revised near-term sequence (each a shippable release)

| Ver | Contents | Notes |
|-----|----------|-------|
| 0.7.0 | `/interactive`: tooltip, crosshair, legendToggle, callbacks | Decision 2; core bytes flat |
| 0.8.0 | `/server`: DOM shim, `renderToString`, `renderChart`, `schema.json` | Decision 1; the keystone |
| 0.9.0 | `@chartlite/mcp` + AGENTS.md/SKILL.md/Eve/llms.txt | Built on 0.8.0 |
| — | breadth (stacked/combo/radial), theming polish, Vue wrapper | Parallelizable, low-risk, can slot anywhere |
| 0.10.0 | API freeze + docs-site coverage + Vue wrapper done | Can't freeze what isn't finished |
| 1.0.0 | Scope lock, announce | Semver commitment |

Breadth and theming aren't on the critical path (Foundation→Architecture→SSR→Agent), so they
ride alongside without blocking the core bet.
