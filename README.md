# Chartlite

**Beautiful charts for modern web apps. Lightweight, fast, and developer-friendly.**

[![Bundle Size](https://img.shields.io/badge/bundle-~13KB_gzipped-success)](https://bundlephobia.com/package/@chartlite/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

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
- **Bar Chart** - Great for comparisons (vertical & horizontal)
- **Area Chart** - Beautiful filled visualizations
- **Scatter Chart** - Correlations and distributions

Plus **multi-series** support, **reference lines**, **annotations**, and **region
highlighting** across chart types. More types coming soon (see the [roadmap](docs/V1_ROADMAP.md)).

### 🎨 Beautiful Themes

```typescript
theme: 'default'    // Clean, professional (Tailwind-inspired)
theme: 'midnight'   // Dark mode
theme: 'minimal'    // Black & white, print-ready
theme: 'material'   // Material Design 3 (coming soon)
theme: 'tailwind'   // Tailwind CSS colors (coming soon)
theme: 'nord'       // Nord color palette (coming soon)
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

### ✅ Shipped

- **Chart types:** Line, Bar, Area, Scatter
- **Multi-series** support with auto-color assignment and a configurable legend
- **Annotations, reference lines & region highlighting**
- **Accessibility:** ARIA roles/descriptions, keyboard navigation, screen-reader data-table fallback
- **Performance:** automatic LTTB downsampling + element pooling for fast updates
- **Plugin system** (tree-shakeable tooltip + debug plugins)
- 4 flexible data formats · 3 built-in themes · responsive sizing · SVG export · TypeScript-first
- Official **React** wrapper

### 🚧 On the way to 1.0

- More chart types: **Pie/Donut, Stacked, Combo, Sparklines, Radial/gauge**
- Pluggable **formatters** (currency/percent/date/abbreviations) & CSS-variable theming
- First-class **interactivity** (built-in tooltips, crosshair, legend toggle, click/hover callbacks)
- **Server-side / zero-JS rendering** (`renderToString`) + a declarative chart spec
- **Agent-native tooling** (MCP server + shippable skill)
- Additional framework wrappers (Vue next)

See the full, sequenced plan in **[V1_ROADMAP.md](docs/V1_ROADMAP.md)**.

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

More examples at [examples/](examples/)

---

## Comparison

| Feature | Chartlite | Recharts | Chart.js | ECharts |
|---------|-----------|----------|----------|---------|
| Bundle Size | **~13KB gz** | ~400KB | ~200KB | ~1000KB |
| Dependencies | **0** | D3 (many) | 0 | ZRender |
| TypeScript | **Native** | Good | Good | Good |
| Chart Types | 3-4 | 10+ | 8+ | 50+ |
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

- Design system themes (Material, Tailwind, Nord)
- Accessibility improvements
- Documentation and examples
- Framework wrappers (Vue, Svelte, Angular)

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
