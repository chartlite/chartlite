# AGENTS.md

Guidance for AI agents working **in this repository**. For guidance on *using*
Chartlite to produce charts, see [`examples/public/llms.txt`](examples/public/llms.txt)
and the shipped skill in [`skills/chartlite/SKILL.md`](skills/chartlite/SKILL.md).

## What this is

Chartlite is a lightweight, zero-dependency SVG charting library. Identity: **small,
fast, beautiful, static-first, agent-native.** Keep changes aligned with that — this
is not a dashboard engine. The road to 1.0 is tracked in
[`docs/V1_ROADMAP.md`](docs/V1_ROADMAP.md) (source of truth) and the critical-path
design in [`docs/DESIGN_TO_1.0.md`](docs/DESIGN_TO_1.0.md).

## Monorepo layout

```
packages/core     @chartlite/core — the library (vanilla TS, SVG)
  src/charts       Line, Bar, Area, Scatter, Pie, Sparkline (+ BaseChart)
  src/render       axes, legend, title, overlays, dataAttrs, constants
  src/a11y         aria/description text, keyboard nav, injected styles
  src/interactive  @chartlite/core/interactive — tooltip/crosshair/legendToggle/callbacks
  src/server       @chartlite/core/server — DOM shim, renderToString, ChartSpec, schema
  src/utils        scales, theme colors, data normalization, sampling, formatters
packages/react    @chartlite/react — thin React wrapper
packages/mcp      @chartlite/mcp — MCP server (render_chart / list_chart_types)
examples          Next.js demo/docs site (deployed via .github/workflows/static.yml)
```

`packages/vue`, `svelte`, `angular` are stubs (ignored by Changesets).

## Setup & common commands

```bash
pnpm install
pnpm build                              # turbo build all packages
pnpm --filter @chartlite/core test      # 400+ vitest tests (jsdom)
pnpm --filter @chartlite/core lint      # tsc --noEmit
pnpm --filter @chartlite/core gen:schema  # regenerate schema.json from src/server/schema.ts
```

Node ≥ 20, pnpm, TypeScript strict. Windows-friendly (avoid Unix-only shell in scripts).

## Non-negotiable conventions

- **Bundle budget:** `@chartlite/core`'s gzipped `dist/index.js` must stay **under
  15360 B** — CI *fails* over budget (`.github/workflows/ci.yml`, `bundle-size` job).
  It's currently ~15 KB with thin headroom. Anything heavy (interactivity, SSR) ships
  as a **separate subpath entry** (`/interactive`, `/server`) so it doesn't count.
  Add new entries to `tsup.config.ts` `entry[]` and the `exports` map.
- **Accessibility parity:** every chart type emits ARIA roles/labels, keyboard-navigable
  `.data-point`s, and a screen-reader data-table fallback. New chart types must match.
- **`data-*` contract:** data points carry `data-x/-y/-series/-series-index/-index` and
  pixel centres `data-cx/-cy` (see `src/render/dataAttrs.ts`); the interactivity plugins
  read these. Keep them when adding shapes.
- **Zero runtime dependencies** in `@chartlite/core`. (`@chartlite/mcp` may depend on the
  MCP SDK + zod; that's its own package.)
- **Tests first-class:** add/extend vitest coverage with any behavior change; keep the
  suite green. Don't weaken assertions to pass.
- **Schema can't drift:** `src/server/schema.ts` is the source of truth; run `gen:schema`
  and commit `schema.json` (a test enforces they match and that the type enum matches the
  render registry).

## Release process (Changesets + npm OIDC)

1. Branch, make the change, `pnpm changeset` (or add a `.changeset/*.md`) describing it.
2. Open a PR. CI runs build/test/lint + the bundle-size gate.
3. Merge to `main`. The Changesets action opens a **"Version Packages" PR** automatically.
4. Merge that PR → `release.yml` publishes via **npm OIDC trusted publishing** (no token).

`@chartlite/core` and `@chartlite/react` version together (Changesets `fixed` group).
Do not hand-edit versions or `CHANGELOG.md` — Changesets owns them.

## Gotchas

- Don't add a runtime dep to core to save code — it breaks the zero-dep promise and the
  budget. Prefer a small local util.
- SSR must not touch the real DOM: `src/server/dom.ts` is a shim installed only when
  `document` is absent, and restored after each synchronous render.
- Hover tooltips live in `@chartlite/core/interactive` as the tree-shakeable `tooltip()`
  action; there is no plugin-based tooltip. (The legacy `TooltipPlugin` was removed in 1.0.)
