"use client";

import { LineChart, BarChart, AreaChart } from "@chartlite/react";
import ExampleCard from "@/components/ExampleCard";
import { FrameworkProvider } from "@/components/FrameworkContext";

export default function MultiSeriesExamples() {
  const financialData = {
    series: [
      { name: "Revenue", dataKey: "revenue" },
      { name: "Costs", dataKey: "costs" },
      { name: "Profit", dataKey: "profit" },
    ],
    data: [
      { month: "Jan", revenue: 4200, costs: 2800, profit: 1400 },
      { month: "Feb", revenue: 4800, costs: 3200, profit: 1600 },
      { month: "Mar", revenue: 5200, costs: 3400, profit: 1800 },
      { month: "Apr", revenue: 4900, costs: 3100, profit: 1800 },
      { month: "May", revenue: 5500, costs: 3600, profit: 1900 },
    ],
  };

  const productSalesData = {
    series: [
      { name: "Product A", dataKey: "productA" },
      { name: "Product B", dataKey: "productB" },
      { name: "Product C", dataKey: "productC" },
    ],
    data: [
      { quarter: "Q1", productA: 450, productB: 380, productC: 290 },
      { quarter: "Q2", productA: 520, productB: 420, productC: 310 },
      { quarter: "Q3", productA: 480, productB: 390, productC: 320 },
      { quarter: "Q4", productA: 590, productB: 450, productC: 350 },
    ],
  };

  const trafficData = {
    series: [
      { name: "Desktop", dataKey: "desktop" },
      { name: "Mobile", dataKey: "mobile" },
      { name: "Tablet", dataKey: "tablet" },
    ],
    data: [
      { month: "Jan", desktop: 3200, mobile: 2100, tablet: 800 },
      { month: "Feb", desktop: 3400, mobile: 2300, tablet: 850 },
      { month: "Mar", desktop: 3600, mobile: 2500, tablet: 900 },
      { month: "Apr", desktop: 3500, mobile: 2600, tablet: 920 },
      { month: "May", desktop: 3800, mobile: 2800, tablet: 950 },
    ],
  };

  return (
    <FrameworkProvider>
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          📊 Multi-Series Charts
        </h1>
        <p className="text-xl text-white/90 mb-2">
          Multiple datasets on one chart with legends, grouped bars, and stacked
          areas
        </p>
        <span className="inline-block px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
          NEW - PHASE 1
        </span>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Example 1: Multi-Series Line Chart */}
        <ExampleCard
          title="Multi-Series Line Chart"
          description="Multiple lines with auto-assigned colors from theme palette"
          badge="NEW"
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
  showPoints: true,
  showLegend: true,
  title: 'Financial Overview'
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
  showPoints={true}
  showLegend={true}
  title="Financial Overview"
/>`,
          }}
        >
          <LineChart
            data={financialData}
            curve="smooth"
            showPoints={true}
            showLegend={true}
            title="Financial Overview"
          />
        </ExampleCard>

        {/* Example 2: Grouped Bar Chart */}
        <ExampleCard
          title="Grouped Bar Chart"
          description="Multiple series displayed as grouped bars side-by-side"
          badge="NEW"
          code={{
            vanilla: `import { BarChart } from '@chartlite/core';

new BarChart('#chart', {
  data: {
    series: [
      { name: 'Product A', dataKey: 'productA' },
      { name: 'Product B', dataKey: 'productB' },
      { name: 'Product C', dataKey: 'productC' }
    ],
    data: [
      { quarter: 'Q1', productA: 450, productB: 380, productC: 290 },
      { quarter: 'Q2', productA: 520, productB: 420, productC: 310 },
      { quarter: 'Q3', productA: 480, productB: 390, productC: 320 },
      { quarter: 'Q4', productA: 590, productB: 450, productC: 350 }
    ]
  },
  showLegend: true,
  title: 'Quarterly Sales by Product'
}).render();`,
            react: `import { BarChart } from '@chartlite/react';

<BarChart
  data={{
    series: [
      { name: 'Product A', dataKey: 'productA' },
      { name: 'Product B', dataKey: 'productB' },
      { name: 'Product C', dataKey: 'productC' }
    ],
    data: [
      { quarter: 'Q1', productA: 450, productB: 380, productC: 290 },
      { quarter: 'Q2', productA: 520, productB: 420, productC: 310 },
      { quarter: 'Q3', productA: 480, productB: 390, productC: 320 },
      { quarter: 'Q4', productA: 590, productB: 450, productC: 350 }
    ]
  }}
  showLegend={true}
  title="Quarterly Sales by Product"
/>`,
          }}
        >
          <BarChart
            data={productSalesData}
            showLegend={true}
            title="Quarterly Sales by Product"
          />
        </ExampleCard>

        {/* Example 3: Stacked Area Chart */}
        <ExampleCard
          title="Stacked Area Chart"
          description="Multiple series stacked cumulatively to show total composition"
          badge="NEW"
          code={{
            vanilla: `import { AreaChart } from '@chartlite/core';

new AreaChart('#chart', {
  data: {
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
  },
  curve: 'smooth',
  fillOpacity: 0.6,
  showLegend: true,
  title: 'Traffic by Device Type'
}).render();`,
            react: `import { AreaChart } from '@chartlite/react';

<AreaChart
  data={{
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
  }}
  curve="smooth"
  fillOpacity={0.6}
  showLegend={true}
  title="Traffic by Device Type"
/>`,
          }}
        >
          <AreaChart
            data={trafficData}
            curve="smooth"
            fillOpacity={0.6}
            showLegend={true}
            title="Traffic by Device Type"
          />
        </ExampleCard>

        {/* Example 4: Custom Colors */}
        <ExampleCard
          title="Multi-Series with Custom Colors"
          description="Override auto-colors with custom color palette"
          code={{
            vanilla: `new LineChart('#chart', {
  data: {
    series: [
      { name: 'Series 1', dataKey: 's1', color: '#3b82f6' },
      { name: 'Series 2', dataKey: 's2', color: '#10b981' },
      { name: 'Series 3', dataKey: 's3', color: '#f59e0b' }
    ],
    data: [
      { x: 'A', s1: 30, s2: 45, s3: 25 },
      { x: 'B', s1: 40, s2: 50, s3: 30 },
      { x: 'C', s1: 35, s2: 48, s3: 35 }
    ]
  },
  curve: 'smooth',
  showLegend: true
}).render();`,
            react: `<LineChart
  data={{
    series: [
      { name: 'Series 1', dataKey: 's1', color: '#3b82f6' },
      { name: 'Series 2', dataKey: 's2', color: '#10b981' },
      { name: 'Series 3', dataKey: 's3', color: '#f59e0b' }
    ],
    data: [
      { x: 'A', s1: 30, s2: 45, s3: 25 },
      { x: 'B', s1: 40, s2: 50, s3: 30 },
      { x: 'C', s1: 35, s2: 48, s3: 35 }
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
                { name: "Series 1", dataKey: "s1", color: "#3b82f6" },
                { name: "Series 2", dataKey: "s2", color: "#10b981" },
                { name: "Series 3", dataKey: "s3", color: "#f59e0b" },
              ],
              data: [
                { x: "A", s1: 30, s2: 45, s3: 25 },
                { x: "B", s1: 40, s2: 50, s3: 30 },
                { x: "C", s1: 35, s2: 48, s3: 35 },
                { x: "D", s1: 45, s2: 55, s3: 40 },
              ],
            }}
            curve="smooth"
            showLegend={true}
          />
        </ExampleCard>

        {/* Example 5: Midnight Theme Multi-Series */}
        <ExampleCard
          title="Multi-Series with Midnight Theme"
          description="Dark theme works great with multi-series charts"
          code={{
            vanilla: `new BarChart('#chart', {
  data: {
    series: [
      { name: 'East', dataKey: 'east' },
      { name: 'West', dataKey: 'west' },
      { name: 'North', dataKey: 'north' }
    ],
    data: [
      { region: 'Jan', east: 45, west: 38, north: 32 },
      { region: 'Feb', east: 52, west: 42, north: 36 },
      { region: 'Mar', east: 48, west: 45, north: 38 }
    ]
  },
  theme: 'midnight',
  showLegend: true,
  title: 'Regional Performance'
}).render();`,
            react: `<BarChart
  data={{
    series: [
      { name: 'East', dataKey: 'east' },
      { name: 'West', dataKey: 'west' },
      { name: 'North', dataKey: 'north' }
    ],
    data: [
      { region: 'Jan', east: 45, west: 38, north: 32 },
      { region: 'Feb', east: 52, west: 42, north: 36 },
      { region: 'Mar', east: 48, west: 45, north: 38 }
    ]
  }}
  theme="midnight"
  showLegend={true}
  title="Regional Performance"
/>`,
          }}
        >
          <BarChart
            data={{
              series: [
                { name: "East", dataKey: "east" },
                { name: "West", dataKey: "west" },
                { name: "North", dataKey: "north" },
              ],
              data: [
                { region: "Jan", east: 45, west: 38, north: 32 },
                { region: "Feb", east: 52, west: 42, north: 36 },
                { region: "Mar", east: 48, west: 45, north: 38 },
                { region: "Apr", east: 55, west: 48, north: 42 },
              ],
            }}
            theme="midnight"
            showLegend={true}
            title="Regional Performance"
          />
        </ExampleCard>
      </div>
    </FrameworkProvider>
  );
}
