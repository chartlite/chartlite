# @chartlite/core

**Beautiful charts for modern web apps. Lightweight, fast, and developer-friendly.**

[![npm version](https://img.shields.io/npm/v/@chartlite/core.svg)](https://www.npmjs.com/package/@chartlite/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@chartlite/core)](https://bundlephobia.com/package/@chartlite/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Chartlite is a high-performance charting library designed for developers who want fast page loads, minimal configuration, and beautiful defaults—all in a ~20KB bundle with zero dependencies.

## Why Chartlite?

- 🚀 **Fast page loads** - ~20KB bundle size (10-15x smaller than alternatives)
- ⚡ **Quick setup** - Beautiful charts with minimal configuration
- 💪 **Modern DX** - TypeScript-first, flexible data formats, zero dependencies
- 🎨 **Beautiful defaults** - Inspired by Tailwind, Material Design, and modern design systems
- 📊 **Multi-series support** - Multiple datasets with auto-colors and legends

## Installation

```bash
npm install @chartlite/core
```

```bash
pnpm add @chartlite/core
```

```bash
yarn add @chartlite/core
```

## Quick Start

```typescript
import { LineChart } from '@chartlite/core';

new LineChart('#chart', {
  data: [
    { x: 'Jan', y: 4200 },
    { x: 'Feb', y: 4800 },
    { x: 'Mar', y: 5200 }
  ],
  curve: 'smooth'
}).render();
```

## Chart Types

### Line Chart

```typescript
import { LineChart } from '@chartlite/core';

new LineChart('#chart', {
  data: [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 }
  ],
  curve: 'smooth', // 'linear' or 'smooth'
  showPoints: true,
  theme: 'default' // 'default', 'midnight', or 'minimal'
}).render();
```

### Bar Chart

```typescript
import { BarChart } from '@chartlite/core';

new BarChart('#chart', {
  data: [
    { x: 'Q1', y: 45000 },
    { x: 'Q2', y: 52000 },
    { x: 'Q3', y: 48000 }
  ],
  orientation: 'vertical' // 'vertical' or 'horizontal'
}).render();
```

### Area Chart

```typescript
import { AreaChart } from '@chartlite/core';

new AreaChart('#chart', {
  data: [
    { x: 'Mon', y: 120 },
    { x: 'Tue', y: 150 },
    { x: 'Wed', y: 180 }
  ],
  curve: 'smooth',
  fillOpacity: 0.3
}).render();
```

## Multi-Series Charts

Display multiple datasets on a single chart with automatic color assignment and legends:

```typescript
new LineChart('#chart', {
  data: {
    series: [
      { name: 'Revenue', dataKey: 'revenue' },
      { name: 'Costs', dataKey: 'costs' },
      { name: 'Profit', dataKey: 'profit' }
    ],
    data: [
      { month: 'Jan', revenue: 4200, costs: 2800, profit: 1400 },
      { month: 'Feb', revenue: 4800, costs: 3200, profit: 1600 },
      { month: 'Mar', revenue: 5200, costs: 3400, profit: 1800 }
    ]
  },
  showLegend: true,
  curve: 'smooth'
}).render();
```

### Grouped Bar Chart

```typescript
new BarChart('#chart', {
  data: {
    series: [
      { name: 'Product A', dataKey: 'productA' },
      { name: 'Product B', dataKey: 'productB' },
      { name: 'Product C', dataKey: 'productC' }
    ],
    data: [
      { quarter: 'Q1', productA: 450, productB: 380, productC: 290 },
      { quarter: 'Q2', productA: 520, productB: 420, productC: 310 }
    ]
  },
  showLegend: true
}).render();
```

### Stacked Area Chart

```typescript
new AreaChart('#chart', {
  data: {
    series: [
      { name: 'Desktop', dataKey: 'desktop' },
      { name: 'Mobile', dataKey: 'mobile' },
      { name: 'Tablet', dataKey: 'tablet' }
    ],
    data: [
      { month: 'Jan', desktop: 3200, mobile: 2100, tablet: 800 },
      { month: 'Feb', desktop: 3400, mobile: 2300, tablet: 850 }
    ]
  },
  showLegend: true,
  curve: 'smooth'
}).render();
```

## Flexible Data Formats

Chartlite supports multiple data formats to fit your needs:

### 1. DataPoint Array (Original)

```typescript
data: [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 45 }
]
```

### 2. Simple Number Array

```typescript
data: [30, 45, 38, 52, 60]
// Auto-generates x values: 0, 1, 2, 3, 4
```

### 3. Column-Oriented (Recommended)

```typescript
data: {
  x: ['Q1', 'Q2', 'Q3', 'Q4'],
  y: [45000, 52000, 48000, 61000]
}
```

### 4. Series-First (For Multi-Series)

```typescript
data: {
  series: [
    { name: 'Revenue', dataKey: 'revenue' }
  ],
  data: [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 4800 }
  ]
}
```

## Themes

Chartlite comes with three built-in themes:

```typescript
theme: 'default'   // Clean, professional (inspired by Tailwind)
theme: 'midnight'  // Dark mode
theme: 'minimal'   // Black & white, print-ready
```

### Custom Colors

```typescript
new LineChart('#chart', {
  data: myData,
  colors: ['#3b82f6', '#10b981', '#f59e0b']
}).render();
```

## Configuration Options

### Common Options (All Charts)

```typescript
{
  data: DataPoint[] | FlexibleDataInput,
  width?: number,              // Default: container width
  height?: number,             // Default: 400
  theme?: 'default' | 'midnight' | 'minimal',
  colors?: string[],           // Custom color palette
  animate?: boolean,           // Default: true
  responsive?: boolean,        // Default: true
  title?: string,
  showLegend?: boolean,        // Default: false (true for multi-series)
  legend?: {
    show?: boolean,
    position?: 'top' | 'right' | 'bottom' | 'left',
    layout?: 'horizontal' | 'vertical'
  }
}
```

### Line Chart Options

```typescript
{
  curve?: 'linear' | 'smooth', // Default: 'linear'
  showPoints?: boolean,        // Default: false
  strokeWidth?: number         // Default: 2
}
```

### Bar Chart Options

```typescript
{
  orientation?: 'vertical' | 'horizontal'  // Default: 'vertical'
}
```

### Area Chart Options

```typescript
{
  curve?: 'linear' | 'smooth', // Default: 'linear'
  fillOpacity?: number         // Default: 0.2 (0-1)
}
```

## Methods

### render()

Render the chart to the DOM:

```typescript
const chart = new LineChart('#chart', { data });
chart.render();
```

### update(data)

Update the chart with new data:

```typescript
chart.update(newData);
```

### destroy()

Clean up and remove the chart:

```typescript
chart.destroy();
```

### toSVG()

Export the chart as an SVG string:

```typescript
const svgString = chart.toSVG();
```

## TypeScript Support

Chartlite is written in TypeScript and provides full type definitions:

```typescript
import { LineChart, type LineChartConfig, type DataPoint } from '@chartlite/core';

const config: LineChartConfig = {
  data: [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 }
  ],
  curve: 'smooth'
};

const chart = new LineChart('#chart', config);
```

## Performance

Chartlite is optimized for:
- **Sweet spot**: 500-2,000 data points
- **Acceptable**: 100-500 points (instant)
- **Max recommended**: 2,000-5,000 points

For larger datasets, consider:
- Data sampling
- Disabling animations: `animate: false`
- Using ECharts or similar for massive datasets

## Browser Support

Chartlite supports all modern browsers that support:
- ES2022+
- SVG rendering
- ResizeObserver API

## Framework Wrappers

- **React**: [@chartlite/react](https://www.npmjs.com/package/@chartlite/react)
- **Vue**: Coming soon
- **Svelte**: Coming soon
- **Angular**: Coming soon

## Examples

Check out our [live examples](https://chartlite.github.io/chartlite/):
- [Basic Examples](https://chartlite.github.io/chartlite/basic-examples.html)
- [Multi-Series Charts](https://chartlite.github.io/chartlite/multi-series.html)
- [Flexible Data Formats](https://chartlite.github.io/chartlite/flexible-data.html)

## Contributing

Contributions are welcome! Please check out our [Contributing Guide](https://github.com/chartlite/chartlite/blob/main/CONTRIBUTING.md).

## License

MIT © [Riel St. Amand](https://github.com/chartlite)

## Links

- [Documentation](https://github.com/chartlite/chartlite#readme)
- [GitHub Repository](https://github.com/chartlite/chartlite)
- [Issue Tracker](https://github.com/chartlite/chartlite/issues)
- [Changelog](https://github.com/chartlite/chartlite/blob/main/docs/CHANGELOG.md)
- [Roadmap](https://github.com/chartlite/chartlite/blob/main/docs/ROADMAP.md)
