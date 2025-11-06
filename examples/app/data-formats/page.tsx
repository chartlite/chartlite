'use client';

import { LineChart, BarChart, AreaChart } from '@chartlite/react';
import ExampleCard from '@/components/ExampleCard';
import { FrameworkProvider } from '@/components/FrameworkContext';

export default function DataFormatsExamples() {
  return (
    <FrameworkProvider>
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          🔄 Flexible Data Formats
        </h1>
        <p className="text-xl text-white/90">
          Chartlite supports multiple data input formats for maximum flexibility
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Format 1: DataPoint Array */}
        <ExampleCard
          title="Original Format: DataPoint[]"
          description="Classic array of objects with x and y properties"
          code={{
            vanilla: `import { LineChart } from '@chartlite/core';

new LineChart('#chart', {
  data: [
    { x: 'Jan', y: 4200 },
    { x: 'Feb', y: 4800 },
    { x: 'Mar', y: 5200 }
  ]
}).render();`,
            react: `import { LineChart } from '@chartlite/react';

<LineChart
  data={[
    { x: 'Jan', y: 4200 },
    { x: 'Feb', y: 4800 },
    { x: 'Mar', y: 5200 }
  ]}
/>`,
          }}
        >
          <LineChart
            data={[
              { x: 'Jan', y: 4200 },
              { x: 'Feb', y: 4800 },
              { x: 'Mar', y: 5200 },
            ]}
          />
        </ExampleCard>

        {/* Format 2: Simple Number Array */}
        <ExampleCard
          title="Simple Array"
          description="Just pass an array of numbers - perfect for quick prototypes"
          badge="NEW"
          code={{
            vanilla: `import { BarChart } from '@chartlite/core';

new BarChart('#chart', {
  data: [30, 45, 38, 52, 60]
}).render();

// Auto-generates x values: 0, 1, 2, 3, 4`,
            react: `import { BarChart } from '@chartlite/react';

<BarChart data={[30, 45, 38, 52, 60]} />

{/* Auto-generates x values: 0, 1, 2, 3, 4 */}`,
          }}
        >
          <BarChart data={[30, 45, 38, 52, 60]} />
        </ExampleCard>

        {/* Format 3: Column-Oriented */}
        <ExampleCard
          title="Column-Oriented"
          description="Intuitive format inspired by data frames and spreadsheets"
          badge="RECOMMENDED"
          code={{
            vanilla: `import { AreaChart } from '@chartlite/core';

new AreaChart('#chart', {
  data: {
    x: ['Q1', 'Q2', 'Q3', 'Q4'],
    y: [45000, 52000, 48000, 61000]
  },
  curve: 'smooth'
}).render();`,
            react: `import { AreaChart } from '@chartlite/react';

<AreaChart
  data={{
    x: ['Q1', 'Q2', 'Q3', 'Q4'],
    y: [45000, 52000, 48000, 61000]
  }}
  curve="smooth"
/>`,
          }}
        >
          <AreaChart
            data={{
              x: ['Q1', 'Q2', 'Q3', 'Q4'],
              y: [45000, 52000, 48000, 61000],
            }}
            curve="smooth"
          />
        </ExampleCard>

        {/* Format 4: Series-First (Single Series) */}
        <ExampleCard
          title="Series-First Format"
          description="Define data structure upfront - great for complex datasets"
          badge="RECOMMENDED"
          code={{
            vanilla: `import { LineChart } from '@chartlite/core';

new LineChart('#chart', {
  data: {
    series: [
      {
        name: 'Revenue',
        dataKey: 'revenue',
        color: '#3b82f6'
      }
    ],
    data: [
      { month: 'Jan', revenue: 4200 },
      { month: 'Feb', revenue: 4800 },
      { month: 'Mar', revenue: 5200 }
    ]
  },
  curve: 'smooth'
}).render();`,
            react: `import { LineChart } from '@chartlite/react';

<LineChart
  data={{
    series: [
      {
        name: 'Revenue',
        dataKey: 'revenue',
        color: '#3b82f6'
      }
    ],
    data: [
      { month: 'Jan', revenue: 4200 },
      { month: 'Feb', revenue: 4800 },
      { month: 'Mar', revenue: 5200 }
    ]
  }}
  curve="smooth"
/>`,
          }}
        >
          <LineChart
            data={{
              series: [
                {
                  name: 'Revenue',
                  dataKey: 'revenue',
                  color: '#3b82f6',
                },
              ],
              data: [
                { month: 'Jan', revenue: 4200 },
                { month: 'Feb', revenue: 4800 },
                { month: 'Mar', revenue: 5200 },
              ],
            }}
            curve="smooth"
          />
        </ExampleCard>

        {/* Format 5: Series-First with Auto-Colors */}
        <ExampleCard
          title="Series-First with Custom xKey"
          description="Specify which field to use for the x-axis"
          code={{
            vanilla: `import { BarChart } from '@chartlite/core';

new BarChart('#chart', {
  data: {
    series: [
      {
        name: 'Sales',
        dataKey: 'sales',
        color: '#10b981'
      }
    ],
    data: [
      { product: 'Product A', sales: 320 },
      { product: 'Product B', sales: 280 },
      { product: 'Product C', sales: 245 }
    ],
    xKey: 'product'  // Specify x-axis key
  },
  orientation: 'horizontal'
}).render();`,
            react: `import { BarChart } from '@chartlite/react';

<BarChart
  data={{
    series: [
      {
        name: 'Sales',
        dataKey: 'sales',
        color: '#10b981'
      }
    ],
    data: [
      { product: 'Product A', sales: 320 },
      { product: 'Product B', sales: 280 },
      { product: 'Product C', sales: 245 }
    ],
    xKey: 'product'
  }}
  orientation="horizontal"
/>`,
          }}
        >
          <BarChart
            data={{
              series: [
                {
                  name: 'Sales',
                  dataKey: 'sales',
                  color: '#10b981',
                },
              ],
              data: [
                { product: 'Product A', sales: 320 },
                { product: 'Product B', sales: 280 },
                { product: 'Product C', sales: 245 },
              ],
              xKey: 'product',
            }}
            orientation="horizontal"
          />
        </ExampleCard>

        {/* Format 6: Column-Oriented Multi-Series */}
        <ExampleCard
          title="Column-Oriented (Multi-Series)"
          description="Column format with multiple y series - uses first series by default"
          code={{
            vanilla: `import { AreaChart } from '@chartlite/core';

new AreaChart('#chart', {
  data: {
    x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    y: {
      temperature: [22, 24, 26, 25, 27],
      humidity: [60, 58, 55, 62, 59]
      // Uses 'temperature' (first series)
    }
  },
  colors: ['#f59e0b'],
  fillOpacity: 0.2
}).render();`,
            react: `import { AreaChart } from '@chartlite/react';

<AreaChart
  data={{
    x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    y: {
      temperature: [22, 24, 26, 25, 27],
      humidity: [60, 58, 55, 62, 59]
    }
  }}
  colors={['#f59e0b']}
  fillOpacity={0.2}
/>`,
          }}
        >
          <AreaChart
            data={{
              x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              y: {
                temperature: [22, 24, 26, 25, 27],
                humidity: [60, 58, 55, 62, 59],
              },
            }}
            colors={['#f59e0b']}
            fillOpacity={0.2}
          />
        </ExampleCard>

        {/* Format 7: Multi-Series Comparison */}
        <ExampleCard
          title="Multi-Series: Series-First Format"
          description="The most powerful format - supports all features including legends"
          badge="RECOMMENDED"
          code={{
            vanilla: `import { LineChart } from '@chartlite/core';

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
  curve: 'smooth',
  showLegend: true
}).render();`,
            react: `import { LineChart } from '@chartlite/react';

<LineChart
  data={{
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
  }}
  curve="smooth"
  showLegend={true}
/>`,
          }}
        >
          <LineChart
            data={{
              series: [
                { name: 'Revenue', dataKey: 'revenue' },
                { name: 'Costs', dataKey: 'costs' },
                { name: 'Profit', dataKey: 'profit' },
              ],
              data: [
                { month: 'Jan', revenue: 4200, costs: 2800, profit: 1400 },
                { month: 'Feb', revenue: 4800, costs: 3200, profit: 1600 },
                { month: 'Mar', revenue: 5200, costs: 3400, profit: 1800 },
              ],
            }}
            curve="smooth"
            showLegend={true}
          />
        </ExampleCard>
      </div>

      {/* Summary Section */}
      <div className="mt-12 bg-white rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Format Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ✅ Best for Simple Charts
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>DataPoint[]</strong> - Classic format, always works</li>
              <li>• <strong>Number[]</strong> - Quick prototypes and demos</li>
              <li>• <strong>Column-Oriented</strong> - Clean, spreadsheet-like</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⭐ Best for Complex Charts
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Series-First</strong> - Multi-series with legends</li>
              <li>• <strong>Custom colors</strong> - Per-series customization</li>
              <li>• <strong>Named axes</strong> - Specify xKey explicitly</li>
            </ul>
          </div>
        </div>
      </div>
    </FrameworkProvider>
  );
}
