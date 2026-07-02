# Chartlite → v1.0 Roadmap

**Status:** In progress
**Current published version:** `0.7.0` (core + react, published to npm via OIDC trusted publishing)
**Author:** planning pass, 2026-07

### Progress so far
- **0.3.0** — Foundation & Truth: Changesets, honest bundle size (~13 KB gz), corrected docs,
  gzipped CI budget, and the previously-unreleased features (scatter, multi-series, plugins,
  a11y, overlays) finally published. Release pipeline moved to **npm OIDC trusted publishing**
  (no long-lived token).
- **0.4.0** — Architecture: `BaseChart` decomposed from **1,920 → 812 lines** into focused
  `src/a11y/` and `src/render/` modules (behaviour-preserving, guarded by the full test suite).
  Plus the new **PieChart** (pie/donut) with full a11y parity — closing the dangling
  `PieChartConfig`.
- **0.5.0** — **tailwind**, **nord**, and **high-contrast** theme presets (previously marketed
  but unimplemented).
- **0.6.0** — **Sparkline** micro-chart + locale-aware **value formatters** (abbreviate /
  currency / percent / number), exported tree-shakeably.
- **0.7.0** — **Interactivity** as a tree-shakeable `@chartlite/core/interactive` entry
  (tooltip, crosshair, legendToggle, callbacks) on a new `data-*` point contract. Core bundle
  unchanged; first fully hands-off release via the auto Version PR.
- **0.8.0** — **SSR / zero-JS**: `@chartlite/core/server` with a zero-dep SVG DOM shim,
  `renderToString(spec)`, the declarative `ChartSpec` type, and a published `schema.json`
  (see design decision 1 in [DESIGN_TO_1.0.md](DESIGN_TO_1.0.md)). Unblocks the agent milestone.

Test suite: **417 passing**. Design for the critical path (SSR shim + interactivity delivery)
is locked in [DESIGN_TO_1.0.md](DESIGN_TO_1.0.md). Remaining: agent tooling (0.9.0), breadth &
theming polish, second wrapper, API freeze (0.10.0).

This document is the single source of truth for the path from today's `0.2.1` to a
credible, stable `1.0.0`. It supersedes the roadmap sections in `README.md` and
`CLAUDE.md`, both of which currently describe an earlier state of the project.

---

## 1. What "1.0" means for Chartlite

1.0 is not "more features." It is a **promise of stability**. Shipping 1.0 commits us to:

- **A frozen public API.** Exported types, chart constructors, and config options in
  `@chartlite/core` don't get breaking changes without a 2.0. This is why the
  foundation/architecture work comes *before* the breadth work — we don't want to
  freeze an API that's built on a 1,920-line god class.
- **Honest, self-consistent docs.** Every claim (bundle size, chart types, themes,
  framework support) is true and verified in CI.
- **Semantic versioning** across all published packages, managed with **Changesets**
  (see 0.3.0) from one source of truth.
- **A stable, deployed docs/demo site** covering every public feature.

### The strategic bet

Chartlite's identity is a deliberate trade-off: **small, fast, beautiful, zero-dep,
static-first.** Every feature below is chosen to *amplify* that identity, not drag the
library toward being a dashboard engine. Two bets shape this roadmap:

1. **Static-first / SSR** — a lightweight library's superpower for landing pages, blogs,
   and docs is shipping charts as **pure SVG with 0KB of client JS**.
2. **Agent-native** — because Chartlite is zero-dep and (soon) headless, it can run inside
   an AI agent's sandbox where heavyweight libs can't. We lean into being *the* chart
   library agents reach for. The chain **SSR → declarative spec → MCP server + skill** is
   the whole story, each link cheap once the previous exists.

### In scope for 1.0
- **Chart types (8):** Line, Bar, Area, Scatter, **Pie/Donut, Stacked (bar/area),
  Combo (line+bar), Sparkline, Radial/gauge**
- **Formatting:** pluggable axis/value/date formatters, locale-aware built-ins,
  null/gap handling, optional data labels
- **Theming:** named presets + **typed custom-theme objects** + **CSS-variable /
  design-token theming** + auto dark mode + `prefers-reduced-motion`
- **Beauty:** gradient fills, on-scroll entrance animation
- **Interactivity (tree-shakeable):** built-in tooltips, crosshair, click-to-toggle
  legend, `onPointClick`/`onHover` callbacks
- **SSR:** headless, DOM-less `renderToString`; declarative `renderChart(spec)` entry;
  published JSON Schema for the config
- **Agent tooling:** `@chartlite/mcp` server, a shipped Agent Skill, `llms.txt` + `AGENTS.md`
- **Accessibility** (already strong — formalize & document)
- **Framework wrappers:** React (complete) + **one** additional wrapper fully done
- **Plugin system** (tooltip, debug) — API stabilized
- Verified bundle-size budget enforced in CI

### Explicitly OUT of scope for 1.0 (candidates for 1.x / 2.0)
- Real-time streaming updates
- Zoom / pan / brush interaction
- Canvas/WebGL renderer for >10k points
- All four framework wrappers "complete" (only React + one more are required for 1.0)
- Heatmaps, candlesticks, geo/maps, and other dashboard-grade types

Locking scope now is what makes 1.0 reachable instead of perpetually "almost." Anything
not on the in-scope list goes to a 1.x backlog, not into 1.0.

---

## 2. Milestone sequence

Ordered by dependency, not by excitement. Each milestone is a shippable release. Some can
overlap (noted), but the **critical path** is: Foundation → Architecture (+ renderer
abstraction) → SSR → Agent tooling.

| Version | Theme | Why it's here | Rough size |
|---------|-------|---------------|-----------|
| **0.3.0** | Foundation & Truth (+ Changesets) | Cheap credibility; sets version baseline | S |
| **0.4.0** | Architecture + renderer abstraction | Decompose god class; **enables SSR** | M–L |
| **0.5.0** | Chart-type breadth | Feature-complete core on a clean base | M |
| **0.6.0** | Formatting, theming & polish | Makes it production-usable & beautiful | M |
| **0.7.0** | Interactivity (tree-shakeable) | Biggest UX gap; static users pay nothing | M |
| **0.8.0** | SSR / zero-JS + declarative spec | The static-first & agent-native enabler | M |
| **0.9.0** | Agent-native tooling | MCP + skill + llms.txt; the distribution bet | M |
| **0.10.0** | API freeze + docs site + 2nd wrapper | Can't freeze what isn't finished | M |
| **1.0.0** | Scope lock & release | Semver commitment, announce | S |

Your current branch is already named `work-for-v0.4.0`, so we're aligned on the
numbering — we just insert 0.3.0 (foundation) ahead of it.

---

## Milestone 0.3.0 — Foundation & Truth

**Goal:** Make the project's story true and self-consistent. No behavior changes.
**Risk:** Very low. **Order:** First — cheapest credibility win; sets the version baseline.

### Tasks
1. **Adopt Changesets as the single source of version truth.**
   - Add `@changesets/cli`, configure for the monorepo, wire into the release workflow.
   - Stop hardcoding `VERSION = '0.2.1'` in
     [`packages/core/src/index.ts`](../packages/core/src/index.ts) — generate it from
     the package version at build time.
   - Bring vue/svelte/angular stubs into line (mark `private`/`0.0.0` so `0.1.0` doesn't
     imply completeness).
2. **Correct the bundle-size story.**
   - Measured today: **47.9 KB minified, 12.7 KB gzipped.** The "~20KB" claim is wrong.
   - New honest headline: **"~13 KB gzipped."**
   - Fix the CI check in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — it
     warns at 20 KB against the *minified* file and silently fires every run. Switch to
     gzipped size with a realistic budget that **fails** (not warns) on regression.
3. **Reconcile docs with reality.** Rewrite the README roadmap (multi-series, annotations,
   reference lines, regions, accessibility, scatter, plugins, element-pooling are
   **shipped**), update `CLAUDE.md` (says v0.0.1 / 3 types), and stop advertising themes
   that don't exist yet.
4. **Fix the dangling `PieChartConfig`** — implement in 0.5.0 or stop exporting it now.

**Acceptance:** README, CLAUDE.md, and package versions agree with the code. Changesets
drives versioning. Bundle check passes on honest numbers. All 346 tests still green.

---

## Milestone 0.4.0 — Architecture: decompose `BaseChart` + renderer abstraction

**Goal:** Break the 1,920-line [`BaseChart.ts`](../packages/core/src/charts/BaseChart.ts)
into focused, testable units **and** introduce a renderer abstraction so the same chart
can emit live DOM *or* an SVG string.
**Risk:** Medium — the 346-test suite is the safety net that makes this the right time.
**Order:** Before breadth/SSR/agents; this milestone is the linchpin for all of them.

### The problem
`BaseChart` owns ~10 responsibilities: SVG setup, dimensions, title, legend, three axis
renderers, reference lines, annotations, regions, accessibility, keyboard nav, the plugin
lifecycle, event tracking, and resize handling.

### Approach (incremental, test-guarded)
Extract one cohesive concern at a time, running the full suite after each:
1. `a11y/` — aria labels, descriptions, trend calc, data-table fallback, style injection.
2. `a11y/keyboard.ts` — focus management, arrow/Home/End, live-region announcements.
3. `render/axes.ts`, `render/legend.ts`, `render/title.ts`.
4. `overlays/` — reference lines, annotations, regions (shared coordinate math).
5. `core/BaseChart.ts` shrinks to lifecycle + composition (target: <500 lines).

### The renderer abstraction (the SSR enabler)
Separate **"compute the chart geometry"** from **"emit it."** Chart logic builds an
element/geometry description; adapters render it:
- **DOM adapter** — `document.createElementNS` (today's behavior).
- **String adapter** — serializes to an SVG string with **no DOM dependency** (enables
  0.8.0 SSR nearly for free).

This one decision is why SSR and the whole agent story become cheap later instead of a
rewrite.

**Acceptance:** All 346 tests pass unchanged. `BaseChart.ts` <~500 lines. Each extracted
module has direct unit tests. Renderer abstraction in place with the DOM adapter as
default. No public API change. Gzipped bundle flat or smaller.

---

## Milestone 0.5.0 — Chart-type breadth

**Goal:** Round out the core to 8 chart types, feature-complete for 1.0.
**Order:** After the refactor, so new code lands on clean seams.

### Tasks (each: full test coverage + accessibility parity)
1. **Pie / Donut** — against the existing `PieChartConfig` (innerRadius, showLabels).
2. **Stacked bar / stacked area** — natural extension of existing multi-series support.
3. **Combo (line + bar)** — `SeriesDefinition` already has `type?: 'line'|'bar'|'area'`,
   so the API half-anticipates this.
4. **Sparklines** — axis-less, legend-less micro-charts; a stripped config over the
   existing line/area/bar path. High value-to-bytes for the "landing-page metrics" niche.
5. **Radial progress / gauge** — small code, popular for KPI/marketing.

**Acceptance:** 8 chart types, each tested + accessible. Bundle stays within budget;
new types tree-shakeable.

---

## Milestone 0.6.0 — Formatting, theming & polish

**Goal:** Make charts production-usable with real data and beautiful by default.

### Formatting & data correctness
- **Pluggable formatters:** `(value) => string` hooks for axis ticks, values, and labels.
- **Built-ins:** number-abbreviation (K/M/B), `Intl.NumberFormat` (currency/percent),
  date formatting — locale-aware.
- **Null/gap handling:** gracefully break lines/areas on missing data.
- **Optional data labels** on points/bars (generalize the existing scatter label concept).

### Theming (does what the marketing already promises)
- Add worthwhile presets: **tailwind, nord, high-contrast** (high-contrast is also an
  a11y win). Widen the `Theme` type accordingly.
- **Typed custom-theme objects** as config input (not just a `colors[]` override) — lean
  on the structured object `getThemeColors()` already returns.
- **CSS-variable / design-token theming** — inherit `--chart-color-N`, `currentColor`, and
  `prefers-color-scheme` from the host site. The modern answer to "match your design
  system," cheaper than a pile of named presets.
- Per-theme WCAG contrast tests (lean on existing `contrastChecker.ts` + audit script).

### Beauty & motion
- **Gradient fills** for area charts (trivial in SVG, reads as premium).
- **On-scroll entrance animation** (IntersectionObserver) — great for marketing pages.
- Respect **`prefers-reduced-motion`** everywhere.

**Acceptance:** Formatters cover currency/percent/abbrev/date; null data renders
correctly; presets + custom + CSS-var theming all type-check and pass contrast tests;
motion respects reduced-motion.

---

## Milestone 0.7.0 — Interactivity (tree-shakeable)

**Goal:** Close the biggest UX gap — interactivity is currently plugin-only.
**Constraint:** Fully tree-shakeable so static/SSR users pay zero bytes.

### Tasks
- **Built-in tooltips** (promote beyond the current plugin) with themeable styling.
- **Crosshair / focus line** on hover for line/area.
- **Click-to-toggle legend** — show/hide series by clicking legend items.
- **Event callbacks:** `onPointClick`, `onHover`, `onLegendToggle` — so a content chart
  can link out or drive app state.

**Acceptance:** Interactivity works across all applicable chart types, is documented, and
is provably tree-shaken out when unused (bundle test).

---

## Milestone 0.8.0 — SSR / zero-JS + declarative spec

**Goal:** Ship charts as pure SVG with 0KB client JS, and make the API declarative.
**Order:** Enabled by the 0.4.0 renderer abstraction; unblocks the agent milestone.

### Tasks
- **`renderToString(config): string`** — headless, DOM-less SVG generation that runs in
  Node/Bun/edge (no jsdom). Uses the string adapter from 0.4.0.
- **Declarative entry point:** `renderChart(spec)` taking a single JSON object (chart type
  + data + options) and returning SVG. Agents and templates emit JSON far more reliably
  than imperative call sequences.
- **Published JSON Schema** for the chart spec, so tools can validate/generate configs.
- Framework SSR notes/examples: Next.js RSC, Astro, SvelteKit — chart as static HTML.
- Progressive enhancement pattern: static SVG server-side, hydrate interactivity only if
  the interactivity module is loaded.

**Acceptance:** `renderToString` produces identical output headless vs. DOM; `renderChart`
+ JSON Schema published and validated in tests; SSR demo deployed for at least Next.js and
Astro.

---

## Milestone 0.9.0 — Agent-native tooling

**Goal:** Make Chartlite the lightweight chart library AI agents reach for.
**Order:** Built on 0.8.0's `renderToString` + declarative spec + JSON Schema.

### Tasks
- **`@chartlite/mcp`** — an MCP server exposing a `render_chart` tool (spec → SVG, and
  optionally PNG). Tool-native, so any MCP-aware agent uses Chartlite with zero API
  knowledge. Cheap to build once SSR + spec exist.
- **A shipped Agent Skill**, authored once and exported in the formats that matter:
  - a Claude/Agent `SKILL.md`,
  - a **Vercel Eve** skill/tool (Eve organizes capabilities as filesystem skills +
    TypeScript tools — a natural drop-in),
  - an **`AGENTS.md`** at the repo root (emerging cross-tool convention).
  Content: chart-type selection guidance, the flexible data formats, theming, SSR usage.
- **`llms.txt` / `llms-full.txt`** at the docs site — accurate, current API guidance for
  coding agents so they don't hallucinate the API.
- Great TSDoc + typed, self-explaining error messages (tell the agent how to fix the input).

**Acceptance:** MCP server published and usable from a reference agent; the skill validated
in Claude + Eve; `llms.txt` + `AGENTS.md` live; a demo of an agent producing a chart from a
natural-language prompt.

---

## Milestone 0.10.0 — API freeze + docs site + second framework wrapper

**Goal:** Freeze the public surface, document everything, and make the multi-framework
claim true with **two** real wrappers.

### Tasks
1. **API review pass.** Walk every export in
   [`packages/core/src/index.ts`](../packages/core/src/index.ts); resolve deprecations
   (e.g. `showLegend` vs `legend.show`); document the `ChartPlugin`/`PluginContext` and
   the declarative-spec contract as stable.
2. **Docs/demo site coverage.** The Next.js site in `examples/` deploys via `static.yml`.
   Ensure a live page for every public feature: all 8 chart types, every theme + CSS-var
   theming, formatters, overlays, interactivity, SSR/zero-JS, the agent/MCP story, and
   accessibility. Publish `llms.txt`.
3. **Second framework wrapper.** Pick the highest-demand next framework (usually Vue).
   Mirror the React wrapper structure ([`packages/react/src`](../packages/react/src)):
   thin component per chart type over the core class, lifecycle wired to
   render/update/destroy, tests + demo page. Downgrade remaining stubs to an honest
   "planned" rather than shipping empty `0.1.0` packages.

**Acceptance:** No planned breaking changes remain. Every public feature has a demo + docs.
Two frameworks fully working.

---

## Milestone 1.0.0 — Scope lock & release

- Confirm every "In scope for 1.0" item is done and tested.
- Full-suite green; CI bundle budget enforced (failing, not warning).
- Version-bump all published packages together via Changesets.
- Release notes + a short 0.x → 1.0 migration note.
- Tag `v1.0.0`, publish, announce (lead with: zero-dep, ~13KB gzipped, SSR/zero-JS,
  agent-native).

**The 1.0 commitment:** from here, the public API of `@chartlite/core` is stable.

---

## 3. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Scope is now large — 1.0 slips forever | Critical path is Foundation→Architecture→SSR→Agent; breadth/theming/interactivity can ship in any order and even slip to 1.1 without blocking the core bet |
| Refactor (0.4.0) silently changes rendering | Full suite after every extraction; no public API change allowed in that milestone; renderer adapters diffed against golden SVG |
| Bundle grows past budget as features land | CI gzipped-size gate **fails** the build; every feature (interactivity, types, themes) must be tree-shakeable |
| SSR output drifts from DOM output | Golden-file test: `renderToString` vs. serialized DOM must match byte-for-byte |
| Agent tooling built on a moving API | Sequence it after the declarative spec exists (0.8) and near the freeze (0.10) |
| Framework wrappers drift from core | Freeze core (0.10) before finishing the second wrapper |

## 4. Suggested immediate next step

Start **0.3.0**. It's low-risk, needs no architectural decisions, and immediately makes the
project's public story honest. I'd begin by wiring up **Changesets** (now decided) plus the
bundle-size correction, since every later milestone references those numbers.

## 5. 1.x backlog (deliberately deferred)

Streaming/real-time · zoom/pan/brush · Canvas/WebGL renderer for >10k points · remaining
framework wrappers (Svelte, Angular) · heatmaps/candlesticks/geo · PNG export from the MCP
server · additional theme presets (Material, GitHub).
