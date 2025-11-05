# Chartlite Roadmap

**Version**: 0.2.0 (Phase 1 Complete)
**Last Updated**: November 5, 2025

## Vision

Build a lightweight (~20KB core), high-performance charting library for **developers building modern web apps**. We're "Recharts but 10x lighter and 5x faster" - professional charts with zero dependencies, beautiful defaults, and TypeScript-first DX.

**Perfect for**: Landing pages with live metrics, blog posts with visualizations, documentation sites, simple internal dashboards.

**Not for**: Real-time monitoring dashboards, complex data exploration tools, applications with millions of data points.

---

## Project Status

### ✅ Phase 0: Foundation (COMPLETED)

- [x] Project structure setup (monorepo with pnpm + Turborepo)
- [x] TypeScript configuration
- [x] Build system (tsup)
- [x] Testing framework (vitest with jsdom)
- [x] Basic documentation (README, CONTRIBUTING, CLAUDE.md)
- [x] LineChart implementation with responsive behavior
- [x] BarChart implementation (vertical & horizontal)
- [x] AreaChart implementation (filled area + line stroke)
- [x] Core utilities and types
- [x] Flexible data format support (4 formats: DataPoint[], number[], Column-Oriented, Series-First)
- [x] Data normalization utilities
- [x] Auto-color extraction from series definitions
- [x] Comprehensive test suite (90+ tests)
- [x] Examples directory with showcases

**Bundle Size**: 16.27 KB (3 chart types + flexible data formats)

### ✅ Phase 1: Multi-Series Support (COMPLETED - November 2025)

**Goal**: Add multi-series rendering to all chart types while staying under 20KB core bundle size.

#### Tasks

- [x] Multi-series LineChart
  - [x] Render multiple lines on one chart
  - [x] Auto-color assignment from theme (8 colors per theme)
  - [x] Static legend component
  - [x] Tests for 2-5 series (15 new tests)
- [x] Multi-series BarChart
  - [x] Grouped bars side-by-side
  - [x] Auto-color assignment
  - [x] Legend support
  - [x] Tests (10 new tests)
- [x] Multi-series AreaChart
  - [x] Stacked areas for cumulative visualization
  - [x] Auto-color assignment
  - [x] Legend support
  - [x] Tests
- [x] Legend component
  - [x] Static legend (non-interactive)
  - [x] Horizontal and vertical layouts
  - [x] Position options (top, right, bottom, left)
  - [x] Integrated in BaseChart
- [x] React wrapper updates
  - [x] Complete AreaChart component
  - [x] Create BarChart component
  - [x] Update all components for multi-series support
- [x] Data transformation enhancements
  - [x] `normalizeToSeriesData()` function
  - [x] `getAllXValues()`, `getCombinedYRange()` utilities
  - [x] Multi-series detection and handling
- [x] Documentation
  - [x] Multi-series examples (`multi-series.html`)
  - [x] Updated CHANGELOG.md
  - [x] Type exports for multi-series

**Bundle Result**: 20.21 KB (within 20KB target + 210 bytes, 1% over)
**Test Coverage**: 139 passing tests (24 new multi-series tests)

### 📍 Phase 2: Annotations & Reference Lines (Q1 2026) **[CORE PRIORITY]**

**Goal**: Add context to charts with reference lines, thresholds, and annotations.

#### Tasks

- [ ] Reference Lines
  - [ ] Horizontal reference lines (thresholds, goals)
  - [ ] Vertical reference lines (events, milestones)
  - [ ] Configurable style (dashed, solid, color)
  - [ ] Optional labels
  - [ ] Tests
- [ ] Annotations
  - [ ] Point annotations (mark specific data points)
  - [ ] Text annotations with positioning
  - [ ] Arrow/callout support
  - [ ] Configurable styles
  - [ ] Tests
- [ ] Region highlighting
  - [ ] Highlight time periods or ranges
  - [ ] Configurable colors and opacity
  - [ ] Optional labels
  - [ ] Tests

**Bundle Target**: Reference lines ~2KB, Annotations ~3KB (both tree-shakeable)

### ♿ Phase 3: Accessibility (Q1 2026) **[CORE PRIORITY]**

**Goal**: Ensure WCAG 2.1 AA compliance for all charts.

#### Accessibility Tasks

- [ ] ARIA labels and roles
  - [ ] Semantic SVG structure
  - [ ] Proper ARIA attributes (role, aria-label, aria-describedby)
  - [ ] Data table fallback for screen readers
  - [ ] Tests with accessibility testing library
- [ ] Keyboard navigation
  - [ ] Tab through chart elements
  - [ ] Arrow keys to navigate data points
  - [ ] Enter/Space to activate tooltips
  - [ ] Tests
- [ ] Color contrast
  - [ ] WCAG AA compliant default colors
  - [ ] Pattern fills as alternative to color
  - [ ] High contrast theme option
  - [ ] Color blindness simulator tests
- [ ] Focus indicators
  - [ ] Visible focus states
  - [ ] Focus order that makes sense
  - [ ] Skip to content support

**Bundle Target**: Core accessibility ~2KB (always included), optional features tree-shakeable

### ✨ Phase 4: Optional Features (Q2 2026) **[NICE-TO-HAVE]**

**Goal**: Add polish features as tree-shakeable modules - only pay for what you use.

#### Tooltips (Tree-shakeable)

- [ ] Tooltip component
  - [ ] Show on hover
  - [ ] Customizable content
  - [ ] Positioning engine (avoid overflow)
  - [ ] Theme support
  - [ ] Tests
- [ ] Multi-series tooltip support
  - [ ] Show all series at X position
  - [ ] Custom formatters
  - [ ] Tests

**Bundle Target**: ~3-4KB (only included if imported)

#### Export Utilities (Tree-shakeable)

- [ ] SVG export
  - [ ] Download as SVG file
  - [ ] Copy to clipboard
  - [ ] Custom filename
- [ ] PNG export
  - [ ] Convert SVG to canvas to PNG
  - [ ] Configurable resolution
  - [ ] Background color option
- [ ] Data export
  - [ ] Export to CSV
  - [ ] Export to JSON
  - [ ] Copy data to clipboard

**Bundle Target**: ~2-3KB (only included if imported)

#### Real-time Updates (Tree-shakeable)

- [ ] Update API enhancements
  - [ ] Smooth transitions on data update
  - [ ] Add/remove data points
  - [ ] Auto-scroll for streaming data
  - [ ] Performance optimization for frequent updates
  - [ ] Tests

**Bundle Target**: ~2KB (only included if imported)

### 🎨 Phase 5: Design System Themes (Q2-Q3 2026)

**Goal**: Add recognizable design system themes that developers instantly understand.

#### Built-in Themes

- [ ] Tailwind CSS theme
  - [ ] Use Tailwind color palette (blue-500, etc.)
  - [ ] Tailwind-inspired spacing and typography
  - [ ] Tests
- [ ] Material Design 3 theme
  - [ ] Material Design color system
  - [ ] Material elevation and shadows
  - [ ] Tests
- [ ] Nord theme
  - [ ] Nord color palette
  - [ ] Minimalist aesthetic
  - [ ] Tests
- [ ] GitHub theme
  - [ ] GitHub Primer colors
  - [ ] Light and dark variants
  - [ ] Tests

#### Theme System

- [ ] Theme builder utilities
  - [ ] Custom theme generator
  - [ ] Theme validation
  - [ ] CSS variable integration
- [ ] Documentation
  - [ ] Theme showcase
  - [ ] Custom theme guide
  - [ ] Color palette reference

**Bundle Target**: Each theme ~1KB (tree-shakeable, only load what you use)

### 🌐 Phase 6: Framework Wrappers & Ecosystem (Q3-Q4 2026)

**Goal**: Make Chartlite accessible across all major frameworks and build ecosystem.

#### Framework Wrappers

- [ ] React wrapper (@chartlite/react)
  - [ ] Hook-based API
  - [ ] All chart components
  - [ ] TypeScript types
  - [ ] Tests
  - [ ] Next.js example
- [ ] Vue 3 wrapper (@chartlite/vue)
  - [ ] Composition API
  - [ ] All chart components
  - [ ] TypeScript support
  - [ ] Tests
  - [ ] Nuxt example
- [ ] Svelte wrapper (@chartlite/svelte)
  - [ ] All chart components
  - [ ] SvelteKit compatibility
  - [ ] Tests
  - [ ] SvelteKit example
- [ ] Angular wrapper (@chartlite/angular)
  - [ ] All chart components
  - [ ] TypeScript support
  - [ ] Tests
  - [ ] Example

#### Documentation & Community

- [ ] Documentation website
  - [ ] Interactive examples with live editor
  - [ ] API reference
  - [ ] Guides and tutorials
  - [ ] Performance tips
  - [ ] Migration guides
- [ ] Integrations
  - [ ] Astro integration
  - [ ] Markdown/MDX support
  - [ ] Static site generator plugins
- [ ] Developer tools
  - [ ] Chart playground
  - [ ] Theme showcase
  - [ ] Bundle size calculator

---

## Success Metrics

### Technical Goals

- **Bundle size**:
  - Core library: ~20KB minified
  - With all optional features: ~30KB minified
  - Each feature independently tree-shakeable
- **Performance**:
  - 60fps animations
  - <16ms render time for 500-2,000 data points
  - Responsive resize <100ms
- **Test coverage**: >80%
- **TypeScript**: 100% typed with strict mode
- **Browser support**: Last 2 versions of modern browsers
- **Accessibility**: WCAG 2.1 AA compliant

### Developer Experience Goals

- Simple API - beautiful charts in <10 lines of code
- TypeScript-first with full autocomplete
- Flexible data formats (4 supported formats)
- Beautiful defaults requiring zero configuration
- Comprehensive documentation with interactive examples
- Single package installation (no plugin hell)

### Adoption Goals

- npm downloads: 1K/month (6 months), 10K/month (12 months)
- GitHub stars: 100 (6 months), 1K (18 months)
- Contributors: 5+ regular contributors (12 months)
- Framework wrappers: All 4 major frameworks (18 months)
- Production usage: 50+ websites (12 months)

### Quality Goals

- Zero critical security vulnerabilities
- <1 day avg issue response time
- <1 week avg PR review time
- Comprehensive documentation with examples
- Active community engagement

---

## Feature Priority Reference

Based on our refined philosophy for developers building modern web apps:

### CORE (Always included or high priority)

- ✅ Multi-Series Support (Phase 1)
- ✅ Reference Lines (Phase 2)
- ✅ Annotations (Phase 2)
- ✅ Accessibility (Phase 3)
- ✅ Design System Themes (Phase 5)

### NICE-TO-HAVE (Tree-shakeable optional features)

- ⭐ Tooltips (Phase 4)
- ⭐ Export Utilities (Phase 4)
- ⭐ Real-time Updates (Phase 4)

### NOT IN SCOPE

- ❌ Click Events (no interactivity beyond accessibility)
- ❌ Interactive Legend (legend is static only)
- ❌ Zoom/Pan (dashboard feature)
- ❌ Brush Selection (dashboard feature)
- ❌ DataZoom (dashboard feature)
- ❌ Complex Filtering (dashboard feature)
- ❌ 3D Charts (out of scope)
- ❌ Real-time monitoring for millions of points (use ECharts)

---

## Dependencies & Blockers

### Critical Dependencies

- **None** (zero runtime dependencies is a core principle)

### Development Dependencies

- TypeScript 5.5+
- Vitest 4.0+
- tsup 8.0+
- Turborepo 2.0+
- jsdom (for testing)

### Potential Blockers

- **Bundle size creep**: Mitigated by strict tree-shaking and size budgets per phase
- **Framework wrapper maintenance**: Delayed to Phase 6 after core is stable
- **Feature scope creep**: Strict "CORE vs NICE vs NOT IN SCOPE" guidelines
- **Accessibility testing**: Need proper testing tools and expertise

---

## Decision Log

### Key Architectural Decisions

1. **SVG over Canvas**: Better for static/semi-static charts, easier styling, print-friendly, accessible
2. **Zero runtime dependencies**: Smaller bundle, no supply chain risk, better security
3. **Framework-agnostic core**: Enables any framework wrapper without core changes
4. **TypeScript-first**: Full type safety, autocomplete, better DX
5. **Monorepo structure**: Code sharing, consistent tooling, single source of truth
6. **Tree-shakeable optional features**: Advanced features in core but only included if imported
7. **Flexible data formats**: Support 4 data formats (DataPoint[], number[], Column-Oriented, Series-First)
8. **Responsive by default**: ResizeObserver for automatic chart resizing

### Philosophy Evolution

**Original**: "Content not dashboards" (implied end-user focus)

**Refined**: Tools for **developers** building modern web apps:

- Landing pages with live metrics
- Blog posts with visualizations
- Documentation sites with charts
- Simple internal dashboards

**Target Audience**: Developers, not executives or end-users. We optimize for DX, not end-user interactivity.

**Positioning**: "Recharts but 10x lighter and 5x faster"

### Deferred/Rejected Decisions

- ❌ **Separate plugin packages** (@chartlite/tooltips, etc.): Rejected - developers hate installing multiple packages. Use tree-shaking instead.
- ❌ **Interactive features** (click events, brush, zoom): Rejected - dashboard features, not our focus
- ❌ **3D charts**: Out of scope entirely
- ❌ **Canvas rendering**: Deferred - SVG works well for our target use cases
- ❌ **Millions of data points**: Out of scope - recommend ECharts for this
- ⏸️ **Web component wrappers**: Deferred - evaluate demand after framework wrappers

---

## How to Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

For roadmap suggestions:

1. Open an issue with the `roadmap` label
2. Describe the feature and its value
3. Consider impact on bundle size and performance
4. Discuss in community forums

---

## Questions or Feedback?

- GitHub Issues: [github.com/yourusername/chartlite/issues](https://github.com/yourusername/chartlite/issues)
- Discussions: [github.com/yourusername/chartlite/discussions](https://github.com/yourusername/chartlite/discussions)
