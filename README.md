# Chartlite

**Beautiful charts for modern web apps. Lightweight, fast, and developer-friendly.**

[![npm](https://img.shields.io/npm/v/@chartlite/core?label=%40chartlite%2Fcore)](https://www.npmjs.com/package/@chartlite/core)
[![Bundle Size](https://img.shields.io/badge/bundle-~13KB_gzipped-success)](https://bundlephobia.com/package/@chartlite/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**🚀 Now stable at 1.0** · **[chartlite.dev →](https://chartlite.dev)** for live demos and docs.

---

## Why Chartlite?

Chartlite is designed for developers who want **beautiful, performant charts** without the bloat.

### The Problem

Modern charting libraries are powerful but heavy:

- **Recharts**: ~400KB (with D3 dependencies)
- **Chart.js**: ~200KB
- **ECharts**: ~1MB (full build)

For a simple landing page or blog post, this is overkill.

### The Solution

Chartlite gives you **professional charts at 10-15x smaller bundle size**:

- ✅ **~13KB gzipped** - Lightning-fast page loads
- ✅ **Zero dependencies** - No D3, no bloat
- ✅ **TypeScript-first** - Full type safety
- ✅ **Multiple data formats** - Maximum flexibility
- ✅ **Accessible by default** - WCAG-minded ARIA + keyboard navigation
- ✅ **Beautiful defaults** - Inspired by Tailwind, Material, Nord

---

## Quick Start

### Installation

```bash
npm install @chartlite/core
# or
pnpm add @chartlite/core
# or
yarn add @chartlite/core
```

Using a framework? Install the matching wrapper instead — each exposes all 8 charts:

```bash
npm install @chartlite/react    # React
npm install @chartlite/vue      # Vue 3
npm install @chartlite/svelte   # Svelte
npm install @chartlite/element  # <chart-lite> web component (any framework / none)
```

### Basic Usage

```typescript
import { LineChart } from '@chartlite/core';

new LineChart('#chart', {
  data: [
    { x: 'Jan', y: 4200 },
    { x: 'Feb', y: 4800 },
    { x: 'Mar', y: 5200 }
  ],
  curve: 'smooth',
  theme: 'default'
}).render();
```

That's it! Your chart is ready.

---

## Features

### 📊 Chart Types

- **Line Chart** - Perfect for trends over time (linear & smooth)
- **Bar Chart** - Great for comparisons (vertical & horizontal, grouped & stacked)
- **Area Chart** - Beautiful filled visualizations (gradient & stacked)
- **Scatter Chart** - Correlations and distributions
- **Pie / Donut Chart** - Part-to-whole breakdowns
- **Radial Chart** - Progress rings and gauges
- **Combo Chart** - Bars plus a trend line/area on shared axes
- **Sparkline** - Tiny, axis-less inline metrics

Plus **multi-series** support, **reference lines**, **annotations**, and **region
highlighting** across chart types — all eight rendering identically in the browser,
on the server, and through every framework wrapper.

### 🎨 Beautiful Themes

```typescript
theme: 'default'        // Clean, professional (Tailwind-inspired)
theme: 'midnight'       // Dark mode
theme: 'minimal'        // Black & white, print-ready
theme: 'tailwind'       // Tailwind CSS colors
theme: 'nord'           // Nord color palette (dark)
theme: 'high-contrast'  // Maximum contrast (accessibility)
theme: 'material'       // Material Design 3 (coming soon)
```

### 📦 Flexible Data Formats

Chartlite accepts data in multiple formats:

```typescript
// 1. Classic DataPoint[] format
data: [{ x: 'Jan', y: 30 }, { x: 'Feb', y: 45 }]

// 2. Simple arrays (auto-generates x values)
data: [30, 45, 38, 52, 60]

// 3. Column-oriented (DataFrame style)
data: {
  x: ['Q1', 'Q2', 'Q3', 'Q4'],
  y: [45000, 52000, 48000, 61000]
}

// 4. Series-first (Ant Design style)
data: {
  series: [{ name: 'Revenue', dataKey: 'revenue', color: '#3b82f6' }],
  data: [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 4800 }
  ]
}
```

### ⚡ Performance

- **Target**: 500-2,000 data points
- **Render time**: <16ms (60fps)
- **Bundle size**: ~13KB gzipped (~48KB minified), zero dependencies
- **Built in**: automatic downsampling (LTTB) and element pooling for fast updates

---

## Roadmap

### ✅ Shipped in 1.0

- **8 chart types:** Line, Bar (grouped/stacked), Area (gradient/stacked), Scatter, Pie/Donut, Radial/gauge, Combo, Sparkline
- **Multi-series** support with auto-color assignment and a configurable legend
- **Annotations, reference lines & region highlighting**
- **Accessibility:** ARIA roles/descriptions, keyboard navigation, screen-reader data-table fallback (WCAG 2.1 AA)
- **Interactivity** (opt-in, tree-shakeable): tooltips, crosshair, legend toggle, click/hover callbacks
- **Server-side / zero-JS rendering** (`renderToString`) + a declarative chart spec
- **Agent-native tooling:** `@chartlite/mcp` server, published JSON Schema, and `llms.txt`
- **CSS-variable theming** (`cssVars`) & pluggable **formatters** (currency/percent/abbreviate)
- **Performance:** automatic LTTB downsampling + element pooling for fast updates
- 4 flexible data formats · 6 built-in themes · responsive sizing · SVG export · TypeScript-first
- Official wrappers for **React, Vue, Svelte** + a **`<chart-lite>`** web component

### 🔭 Post-1.0 ideas

- More design-system themes (Material 3, GitHub)
- An Angular wrapper
- Additional chart types as demand warrants

The road to 1.0 is archived in **[V1_ROADMAP.md](docs/V1_ROADMAP.md)**.

---

## Examples

### React

```tsx
import { LineChart } from '@chartlite/react';

function App() {
  return (
    <LineChart
      data={monthlyRevenue}
      curve="smooth"
      theme="tailwind"
    />
  );
}
```

### Vanilla JS

```html
<div id="my-chart"></div>

<script type="module">
  import { BarChart } from '@chartlite/core';

  new BarChart('#my-chart', {
    data: {
      x: ['Product A', 'Product B', 'Product C'],
      y: [120, 280, 190]
    },
    orientation: 'horizontal'
  }).render();
</script>
```

### Server-side / agents (zero client JS)

```typescript
import { renderToString } from '@chartlite/core/server';

// Runs in Node/Bun/edge — no browser, no jsdom. Drop the string straight into HTML.
const svg = renderToString({ type: 'line', data: [1, 2, 3], theme: 'tailwind' });
```

The object passed to `renderToString` is a **ChartSpec** — the same shape the
[`@chartlite/mcp`](packages/mcp) server's `render_chart` tool accepts, described by a
published JSON Schema. AI agents and your server build charts the exact same way.

More examples at [examples/](examples/) · live at **[chartlite.dev](https://chartlite.dev)**

---

## Comparison

| Feature | Chartlite | Recharts | Chart.js | ECharts |
|---------|-----------|----------|----------|---------|
| Bundle Size | **~13KB gz** | ~400KB | ~200KB | ~1000KB |
| Dependencies | **0** | D3 (many) | 0 | ZRender |
| TypeScript | **Native** | Good | Good | Good |
| Chart Types | 8 | 10+ | 8+ | 50+ |
| Data Formats | **4** | 1 | 1 | 2 |
| Learning Curve | **Low** | Medium | Low | High |
| **Best For** | **Fast pages** | React apps | Simple charts | Dashboards |

---

## When to Choose Chartlite

### ✅ Perfect For:

- Landing pages with live metrics
- Blog posts with data visualization
- Documentation with charts
- Marketing sites (fast page loads critical)
- Simple internal dashboards
- Projects where bundle size matters

### ❌ Not For:

- Real-time monitoring dashboards
- Complex data exploration tools
- Applications with millions of data points
- Projects needing 50+ chart types
- Advanced filtering/zooming requirements

**For those use cases**, we recommend [Apache ECharts](https://echarts.apache.org/) or [Recharts](https://recharts.org/).

---

## Philosophy

### The Trade-off

We deliberately trade **feature breadth** for:

1. **Performance** - 5-10x faster rendering
2. **Bundle size** - 10-15x smaller
3. **Developer Experience** - Simple, TypeScript-first API
4. **Zero Dependencies** - No supply chain risk

### Design Principles

1. **Beautiful by Default** - Professional themes, no config needed
2. **Developer Experience First** - TypeScript, flexible data formats
3. **Performance Conscious** - 20KB budget, <16ms renders
4. **Accessibility Non-Negotiable** - WCAG 2.1 AA compliant
5. **Progressive Enhancement** - Optional features are truly optional

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Priority areas:**

- Design system themes (Material 3, GitHub)
- Accessibility improvements
- Documentation and examples
- An Angular wrapper (React, Vue, Svelte, and the web component are shipped)

---

## License

MIT © Riel St. Amand

---

## Acknowledgments

Inspired by the best:

- **Apache ECharts** - For beautiful defaults and declarative API
- **SciChart** - For professional themes and performance
- **Recharts** - For React-friendly composability
- **Tailwind CSS** - For color systems and design tokens

---

## Links

- [Documentation](docs/)
- [Examples](examples/)
- [Roadmap](docs/V1_ROADMAP.md)
- [Contributing](CONTRIBUTING.md)
- [Issues](https://github.com/chartlite/chartlite/issues)

---

<p align="center">
  <strong>Made with ❤️ for developers who care about performance</strong>
</p>
