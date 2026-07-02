# Chartlite for Vercel Eve

A drop-in [Vercel Eve](https://github.com/vercel-labs/eve) capability for rendering
charts. Eve organizes capabilities as **filesystem skills** (Markdown) plus **TypeScript
tools**, so this folder ships both:

```
eve/
  skills/chartlite/skill.md   # when & how an agent should make a chart
  tools/render-chart.ts       # the executable tool (spec -> SVG)
```

## Install into an Eve project

Copy `skills/chartlite/` into your Eve skills directory and `tools/render-chart.ts` into
your Eve tools directory, then install the runtime dependency:

```bash
pnpm add @chartlite/core
```

The tool imports `renderToString` from `@chartlite/core/server`, which is headless
(no browser/DOM) and therefore safe to run in Eve's environment.

`render-chart.ts` is written to be adapted to your Eve version's tool helper (e.g.
`defineTool` / `tool`); it also exports a plain `renderChart(spec)` function you can call
directly. See the file's header comment.
