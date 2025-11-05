# @chartlite/react

**React wrapper for Chartlite - Beautiful, lightweight charts for React apps.**

[![npm version](https://img.shields.io/npm/v/@chartlite/react.svg)](https://www.npmjs.com/package/@chartlite/react)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@chartlite/react)](https://bundlephobia.com/package/@chartlite/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

React components for Chartlite, a high-performance charting library with ~20KB bundle size and zero dependencies.

## Why Chartlite for React?

- 🚀 **Tiny bundle** - ~20KB core + minimal React wrapper
- ⚛️ **React-friendly** - Hooks-based, automatic cleanup, reactive updates
- 💪 **TypeScript-first** - Full type safety with intelligent autocomplete
- 🎨 **Beautiful defaults** - Professional themes out of the box
- 📊 **Multi-series support** - Multiple datasets with auto-colors and legends

## Installation

```bash
npm install @chartlite/react @chartlite/core
```

```bash
pnpm add @chartlite/react @chartlite/core
```

```bash
yarn add @chartlite/react @chartlite/core
```

## Quick Start

```tsx
import { LineChart } from '@chartlite/react';

function App() {
  return (
    <LineChart
      data={[
        { x: 'Jan', y: 4200 },
        { x: 'Feb', y: 4800 },
        { x: 'Mar', y: 5200 }
      ]}
      curve="smooth"
    />
  );
}
```

## Chart Components

### LineChart

```tsx
import { LineChart } from '@chartlite/react';

function RevenueChart() {
  const data = [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 },
    { x: 'Apr', y: 52 }
  ];

  return (
    <LineChart
      data={data}
      curve="smooth"
      showPoints={true}
      theme="default"
      title="Monthly Revenue"
      style={{ width: '100%', height: 400 }}
    />
  );
}
```

### BarChart

```tsx
import { BarChart } from '@chartlite/react';

function SalesChart() {
  const data = [
    { x: 'Q1', y: 45000 },
    { x: 'Q2', y: 52000 },
    { x: 'Q3', y: 48000 },
    { x: 'Q4', y: 61000 }
  ];

  return (
    <BarChart
      data={data}
      orientation="vertical"
      theme="midnight"
      className="my-chart"
    />
  );
}
```

### AreaChart

```tsx
import { AreaChart } from '@chartlite/react';

function TrafficChart() {
  const data = [
    { x: 'Mon', y: 120 },
    { x: 'Tue', y: 150 },
    { x: 'Wed', y: 180 },
    { x: 'Thu', y: 170 },
    { x: 'Fri', y: 200 }
  ];

  return (
    <AreaChart
      data={data}
      curve="smooth"
      fillOpacity={0.3}
      colors={['#3b82f6']}
    />
  );
}
```

## Multi-Series Charts

Display multiple datasets with automatic color assignment and legends:

### Multi-Series Line Chart

```tsx
import { LineChart } from '@chartlite/react';

function FinancialChart() {
  const data = {
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
  };

  return (
    <LineChart
      data={data}
      showLegend={true}
      curve="smooth"
      showPoints={true}
      title="Financial Overview"
    />
  );
}
```

### Grouped Bar Chart

```tsx
import { BarChart } from '@chartlite/react';

function ProductSalesChart() {
  const data = {
    series: [
      { name: 'Product A', dataKey: 'productA' },
      { name: 'Product B', dataKey: 'productB' },
      { name: 'Product C', dataKey: 'productC' }
    ],
    data: [
      { quarter: 'Q1', productA: 450, productB: 380, productC: 290 },
      { quarter: 'Q2', productA: 520, productB: 420, productC: 310 },
      { quarter: 'Q3', productA: 480, productB: 390, productC: 320 },
      { quarter: 'Q4', productA: 610, productB: 450, productC: 350 }
    ]
  };

  return (
    <BarChart
      data={data}
      showLegend={true}
      legend={{ position: 'top', layout: 'horizontal' }}
      title="Quarterly Sales by Product"
    />
  );
}
```

### Stacked Area Chart

```tsx
import { AreaChart } from '@chartlite/react';

function DeviceTrafficChart() {
  const data = {
    series: [
      { name: 'Desktop', dataKey: 'desktop' },
      { name: 'Mobile', dataKey: 'mobile' },
      { name: 'Tablet', dataKey: 'tablet' }
    ],
    data: [
      { month: 'Jan', desktop: 3200, mobile: 2100, tablet: 800 },
      { month: 'Feb', desktop: 3400, mobile: 2300, tablet: 850 },
      { month: 'Mar', desktop: 3600, mobile: 2500, tablet: 900 }
    ]
  };

  return (
    <AreaChart
      data={data}
      showLegend={true}
      curve="smooth"
      fillOpacity={0.6}
      title="Traffic by Device Type"
    />
  );
}
```

## Reactive Updates

Charts automatically update when data changes:

```tsx
import { useState } from 'react';
import { LineChart } from '@chartlite/react';

function InteractiveChart() {
  const [data, setData] = useState([
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 }
  ]);

  const addDataPoint = () => {
    setData([...data, { x: `Month ${data.length + 1}`, y: Math.random() * 100 }]);
  };

  return (
    <div>
      <LineChart data={data} curve="smooth" />
      <button onClick={addDataPoint}>Add Data Point</button>
    </div>
  );
}
```

## Flexible Data Formats

Chartlite React supports multiple data formats:

### 1. DataPoint Array

```tsx
<LineChart
  data={[
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 }
  ]}
/>
```

### 2. Simple Number Array

```tsx
<BarChart data={[30, 45, 38, 52, 60]} />
```

### 3. Column-Oriented

```tsx
<AreaChart
  data={{
    x: ['Q1', 'Q2', 'Q3', 'Q4'],
    y: [45000, 52000, 48000, 61000]
  }}
/>
```

### 4. Series-First (Multi-Series)

```tsx
<LineChart
  data={{
    series: [
      { name: 'Revenue', dataKey: 'revenue' }
    ],
    data: [
      { month: 'Jan', revenue: 4200 },
      { month: 'Feb', revenue: 4800 }
    ]
  }}
/>
```

## Themes

Choose from three built-in themes:

```tsx
<LineChart data={data} theme="default" />   {/* Clean, professional */}
<LineChart data={data} theme="midnight" />  {/* Dark mode */}
<LineChart data={data} theme="minimal" />   {/* Black & white */}
```

### Custom Colors

```tsx
<LineChart
  data={data}
  colors={['#3b82f6', '#10b981', '#f59e0b']}
/>
```

## Props

### Common Props (All Charts)

```tsx
interface CommonProps {
  data: DataPoint[] | FlexibleDataInput;
  className?: string;
  style?: React.CSSProperties;
  theme?: 'default' | 'midnight' | 'minimal';
  colors?: string[];
  animate?: boolean;
  responsive?: boolean;
  title?: string;
  showLegend?: boolean;
  legend?: {
    show?: boolean;
    position?: 'top' | 'right' | 'bottom' | 'left';
    layout?: 'horizontal' | 'vertical';
  };
}
```

### LineChart Props

```tsx
interface LineChartProps extends CommonProps {
  curve?: 'linear' | 'smooth';
  showPoints?: boolean;
  strokeWidth?: number;
}
```

### BarChart Props

```tsx
interface BarChartProps extends CommonProps {
  orientation?: 'vertical' | 'horizontal';
}
```

### AreaChart Props

```tsx
interface AreaChartProps extends CommonProps {
  curve?: 'linear' | 'smooth';
  fillOpacity?: number;
}
```

## Styling

### Using className

```tsx
<LineChart
  data={data}
  className="my-chart shadow-lg rounded-lg"
/>
```

### Using style

```tsx
<LineChart
  data={data}
  style={{
    width: '100%',
    height: 400,
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  }}
/>
```

## TypeScript Support

Full TypeScript support with type definitions:

```tsx
import { LineChart, type LineChartConfig, type DataPoint } from '@chartlite/react';

interface ChartData extends DataPoint {
  x: string;
  y: number;
}

function TypedChart() {
  const data: ChartData[] = [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 }
  ];

  const config: Partial<LineChartConfig> = {
    curve: 'smooth',
    showPoints: true
  };

  return <LineChart data={data} {...config} />;
}
```

## Performance Tips

For optimal performance:

```tsx
// 1. Memoize data if it doesn't change often
const data = useMemo(() => generateData(), []);

// 2. Disable animations for large datasets
<LineChart data={largeData} animate={false} />

// 3. Disable responsive for static layouts
<LineChart data={data} responsive={false} />

// 4. Sample data for very large datasets
const sampledData = useMemo(
  () => largeData.filter((_, i) => i % 10 === 0),
  [largeData]
);
```

## Server-Side Rendering (SSR)

Chartlite React works with SSR frameworks like Next.js:

```tsx
'use client'; // For Next.js App Router

import { LineChart } from '@chartlite/react';

export default function Chart() {
  return <LineChart data={data} />;
}
```

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

- [Core Package (@chartlite/core)](https://www.npmjs.com/package/@chartlite/core)
- [Documentation](https://github.com/chartlite/chartlite#readme)
- [GitHub Repository](https://github.com/chartlite/chartlite)
- [Issue Tracker](https://github.com/chartlite/chartlite/issues)
- [Changelog](https://github.com/chartlite/chartlite/blob/main/docs/CHANGELOG.md)
- [Roadmap](https://github.com/chartlite/chartlite/blob/main/docs/ROADMAP.md)
