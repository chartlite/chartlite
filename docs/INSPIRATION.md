# Chartlite Feature Inspirations

## Learning from the Best: ECharts, SciChart, and Recharts

### Our Philosophy

**Target Audience**: Developers building modern web apps (landing pages, blogs, docs, simple dashboards)

**Core Principles**:

- **Developer Experience First**: Beautiful defaults, flexible data formats, TypeScript-first
- **Performance Conscious**: Efficient for 500-2,000 data points, <16ms render time
- **Lightweight by Default**: ~20KB core, tree-shakeable optional features
- **Zero Dependencies**: Pure TypeScript/JavaScript only
- **Accessible**: WCAG 2.1 AA compliant
- **Not a Dashboard Library**: No complex interactivity, zoom/pan, or real-time monitoring for millions of points

**Positioning**: "Recharts but 10x lighter and 5x faster"

---

## What We're Taking from Each Library

### 🎨 From Apache ECharts

#### 1. **Beautiful Defaults** ✅ CORE

**What We Love**: ECharts charts look professional immediately, no tweaking needed

**What We're Adopting**:

- Professional color palettes out of the box
- Thoughtful spacing and typography
- Consistent design language across all chart types
- Beautiful themes (inspired by their approach, not copied)

**Bundle Impact**: Included in core (~20KB)
**Status**: Partially implemented (3 themes: default, midnight, minimal)

#### 2. **Declarative API** ✅ CORE

**What We Love**: ECharts' single config object is intuitive and TypeScript-friendly

**What We're Adopting**:

- Single configuration object per chart
- TypeScript-first with full autocomplete
- Sensible defaults for everything
- Easy to understand without docs

**Example**:

```typescript
new LineChart('#chart', {
  data: monthlyRevenue,
  curve: 'smooth',
  theme: 'tailwind',
  title: 'Monthly Revenue'
}).render();
```

**Bundle Impact**: Included in core (~20KB)
**Status**: Implemented

#### 3. **Multi-Series Support** 🎯 Phase 1 (CORE)

**What We Love**: Multiple datasets on one chart with automatic color assignment

**What We're Adopting**:

- Render multiple lines/bars/areas on one chart
- Auto-color assignment from theme palette
- Static legend (non-interactive, unlike ECharts)
- Series-first data format support

**Example**:

```typescript
data: {
  series: [
    { name: 'Revenue', dataKey: 'revenue', color: '#3b82f6' },
    { name: 'Profit', dataKey: 'profit', color: '#10b981' }
  ],
  data: [
    { month: 'Jan', revenue: 4200, profit: 1200 },
    { month: 'Feb', revenue: 4800, profit: 1400 }
  ]
}
```

**Bundle Impact**: ~3-4KB (tree-shakeable)
**Status**: Planned for Phase 1

---

### ⚡ From SciChart

#### 1. **Professional Themes** 🎨 Phase 5 (CORE)

**What We Love**: SciChart's design system themes look instantly professional

**What We're Adopting**:

- Design system themes: `tailwind`, `material`, `nord`, `github`
- Developers instantly recognize these design languages
- Dark/light variants for each
- Custom theme builder utilities

**Example**:

```typescript
new LineChart('#chart', {
  data: monthlyRevenue,
  theme: 'tailwind' // Uses Tailwind color palette
});
```

**Bundle Impact**: ~1KB per theme (tree-shakeable, load only what you use)
**Status**: Planned for Phase 5

#### 2. **Reference Lines & Annotations** 🎯 Phase 2 (CORE)

**What We Love**: Mark thresholds, goals, and important events directly on charts

**What We're Adopting**:

- Horizontal/vertical reference lines
- Point annotations
- Text annotations with arrows
- Region highlighting
- Configurable styles (dashed, solid, colors)

**Example**:

```typescript
referenceLine: [
  { y: 5000, label: 'Target', stroke: '#10b981', strokeDasharray: '5 5' },
  { x: 'Mar', label: 'Launch', stroke: '#3b82f6' }
],
annotations: [
  { x: 'Feb', y: 4800, text: 'Peak sales', arrow: true }
]
```

**Bundle Impact**: ~2KB reference lines + ~3KB annotations (both tree-shakeable)
**Status**: Planned for Phase 2

---

### 🎯 From Recharts

#### 1. **Composable API** ✅ CORE

**What We Love**: Recharts makes it easy to build complex charts from simple pieces

**What We're Adopting**:

- Base chart classes that extend easily
- Flexible data format support (4 formats!)
- Simple, predictable API
- TypeScript-first with excellent autocomplete

**Example** (multiple data formats work):

```typescript
// Format 1: DataPoint[]
data: [{ x: 'Jan', y: 30 }, { x: 'Feb', y: 45 }]

// Format 2: Simple array
data: [30, 45, 38, 52]

// Format 3: Column-oriented
data: { x: ['Jan', 'Feb', 'Mar'], y: [30, 45, 38] }

// Format 4: Series-first
data: {
  series: [{ name: 'Revenue', dataKey: 'revenue' }],
  data: [{ month: 'Jan', revenue: 30 }]
}
```

**Bundle Impact**: Included in core (~20KB)
**Status**: Implemented

#### 2. **Responsive by Default** ✅ CORE

**What We Love**: Charts that just work at any size

**What We're Adopting**:

- ResizeObserver for automatic sizing
- Responsive behavior enabled by default
- Fill container unless explicit width/height provided
- Smooth resize transitions

**Bundle Impact**: Included in core (~20KB)
**Status**: Implemented

---

## Optional Features (Tree-Shakeable)

These features are planned but **only included if you import them**. Pay for what you use!

### ⭐ Tooltips - Phase 4 (NICE-TO-HAVE)

**What**: Show data values on hover

**Why We Want It**: Improves UX for users exploring the data

**Implementation**:

```typescript
import { LineChart } from '@chartlite/core';
import { Tooltip } from '@chartlite/core/tooltip'; // Tree-shakeable!

new LineChart('#chart', {
  data: monthlyRevenue,
  tooltip: {
    enabled: true,
    formatter: (point) => `${point.x}: $${point.y}`
  }
}).render();
```

**Bundle Impact**: ~3-4KB (only if imported)
**Status**: Planned for Phase 4

### ⭐ Export Utilities - Phase 4 (NICE-TO-HAVE)

**What**: Download charts as SVG/PNG or export data

**Why We Want It**: Useful for reports and sharing

**Implementation**:

```typescript
import { LineChart } from '@chartlite/core';
import { exportSVG, exportPNG, exportCSV } from '@chartlite/core/export';

const chart = new LineChart('#chart', { data: monthlyRevenue });
exportSVG(chart, 'revenue-chart.svg');
exportPNG(chart, 'revenue-chart.png', { width: 1200, height: 800 });
exportCSV(chart.data, 'revenue-data.csv');
```

**Bundle Impact**: ~2-3KB (only if imported)
**Status**: Planned for Phase 4

### ⭐ Real-time Updates - Phase 4 (NICE-TO-HAVE)

**What**: Smooth transitions when data changes

**Why We Want It**: Nice for live metrics on landing pages

**Implementation**:

```typescript
import { LineChart } from '@chartlite/core';
import { enableRealtime } from '@chartlite/core/realtime';

const chart = new LineChart('#chart', { data: initialData });
enableRealtime(chart, {
  transitionDuration: 300,
  maxDataPoints: 50 // Auto-scroll after 50 points
});

// Update data smoothly
setInterval(() => {
  chart.update(fetchLatestData());
}, 5000);
```

**Bundle Impact**: ~2KB (only if imported)
**Status**: Planned for Phase 4

---

## What We're NOT Doing (and Why)

### ❌ Dashboard Features

These are out of scope - use ECharts or Recharts for these needs:

- **DataZoom / Zoom & Pan**: Dashboard feature, not needed for content
- **Brush Selection**: Complex data exploration, not our focus
- **Interactive Legend**: Adds interactivity we don't need, legend stays static. It's on or off.
- **Synchronized Charts**: Dashboard feature
- **Click Events**: No complex interactivity beyond accessibility
- **Virtual Rendering for Millions of Points**: Out of scope, target is 500-2,000 points

**Why**: We're building for developers creating modern web apps, not analytics dashboards. If you need these features, we recommend ECharts (full dashboards) or Recharts (React dashboards).

### ❌ 3D Charts

- Too heavy (would blow bundle budget)
- Limited use cases in content
- Better served by specialized libraries

### ❌ Separate Plugin Packages

**Rejected Approach**:

```typescript
// ❌ NO - Multiple packages to install
npm install @chartlite/core
npm install @chartlite/tooltips
npm install @chartlite/export
```

**Our Approach Instead**:

```typescript
// ✅ YES - Single package, tree-shakeable imports
npm install @chartlite/core

import { LineChart } from '@chartlite/core';
import { Tooltip } from '@chartlite/core/tooltip'; // Only if needed
```

**Why**: Developers hate installing 2-3 packages to get basic functionality. We put everything in core but make it tree-shakeable, so you only pay for what you import.

---

## Bundle Size Strategy

**Current Status**: 16.27 KB (core with 3 chart types + flexible data formats)

**Roadmap**:

| Phase | Features | Bundle Size | Strategy |
|-------|----------|-------------|----------|
| **Phase 0** ✅ | Line, Bar, Area charts + flexible data | 16.27 KB | Core |
| **Phase 1** | Multi-series support + static legend | +3-4 KB | Tree-shakeable |
| **Phase 2** | Reference lines + annotations | +5 KB | Tree-shakeable |
| **Phase 3** | Accessibility (ARIA, keyboard nav) | +2 KB | Always included |
| **Phase 4** | Tooltips, export, real-time | +7-9 KB | Tree-shakeable (opt-in) |
| **Phase 5** | Design system themes | +4-6 KB | Tree-shakeable (1KB/theme) |
| **Maximum** | Core + all features | ~30-35 KB | Only if you import everything |

**Key Points**:

- **Core stays ~20KB**: Essential charts and features only
- **Tree-shaking works**: Only pay for what you import
- **No separate packages**: Everything in `@chartlite/core`, just import what you need
- **Accessibility included**: Core feature, not optional

---

## Design Principles We're Following

### From ECharts

- ✅ **Declarative Config**: Single config object, describe what you want
- ✅ **Beautiful by Default**: Professional themes out of the box
- ❌ **Feature Breadth**: We're trading breadth for bundle size

### From SciChart

- ✅ **Professional Polish**: Design system themes (Tailwind, Material, Nord)
- ✅ **Performance First**: Optimized for 500-2,000 data points
- ❌ **Enterprise Features**: No virtual rendering for millions of points

### From Recharts

- ✅ **Developer Experience**: TypeScript-first, flexible data formats
- ✅ **Composability**: Build complex from simple base charts
- ✅ **Sensible Defaults**: Works great with zero config
- ✅ **Responsive**: ResizeObserver for automatic sizing
- ❌ **React-specific**: We're framework-agnostic

---

## Summary: What Makes Chartlite Different

**Positioning**: "Recharts but 10x lighter and 5x faster"

**Target Audience**: Developers building modern web apps (not dashboard users)

**Core Strengths**:

1. **Tiny bundle**: ~20KB core vs 400KB for Recharts
2. **Zero dependencies**: No D3, no supply chain risk
3. **Beautiful defaults**: Inspired by Tailwind, Material, Nord
4. **Flexible data**: 4 input formats supported
5. **TypeScript-first**: Full type safety and autocomplete
6. **Tree-shakeable**: Advanced features only if imported
7. **Accessible**: WCAG 2.1 AA compliant (core priority)

**What We're NOT**:

- ❌ Not a dashboard library (no zoom/pan, brush, complex interactivity)
- ❌ Not for millions of data points (use ECharts for that)
- ❌ Not trying to do everything (focused scope)

**Perfect For**:

- ✅ Landing pages with live metrics
- ✅ Blog posts with visualizations
- ✅ Documentation sites
- ✅ Simple internal dashboards
- ✅ Any project where bundle size matters
