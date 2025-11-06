'use client';

import { LineChart, BarChart, AreaChart } from '@chartlite/react';
import ExampleCard from '@/components/ExampleCard';
import { FrameworkProvider } from '@/components/FrameworkContext';

export default function BasicExamples() {
  const basicLineData = [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 },
    { x: 'Apr', y: 52 },
    { x: 'May', y: 48 },
  ];

  return (
    <FrameworkProvider>
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          📈 Basic Examples
        </h1>
        <p className="text-xl text-white/90">
          Explore LineChart, BarChart, and AreaChart with different themes and configurations
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Example 1: Basic Line Chart */}
        <ExampleCard
          title="Basic Line Chart"
          description="Simple line chart with default settings and theme"
          code={{
            vanilla: `import { LineChart } from '@chartlite/core';

new LineChart('#chart', {
  data: [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 },
    { x: 'Apr', y: 52 },
    { x: 'May', y: 48 },
  ],
}).render();`,
            react: `import { LineChart } from '@chartlite/react';

function Chart() {
  const data = [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 },
    { x: 'Apr', y: 52 },
    { x: 'May', y: 48 },
  ];

  return <LineChart data={data} />;
}`,
          }}
        >
          <LineChart data={basicLineData} />
        </ExampleCard>

        {/* Example 2: Smooth Curve */}
        <ExampleCard
          title="Smooth Curve"
          description="Line chart with smooth bezier curves"
          code={{
            vanilla: `new LineChart('#chart', {
  data: [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 },
  ],
  curve: 'smooth',
  showPoints: true,
}).render();`,
            react: `<LineChart
  data={data}
  curve="smooth"
  showPoints={true}
/>`,
          }}
        >
          <LineChart data={basicLineData} curve="smooth" showPoints={true} />
        </ExampleCard>

        {/* Example 3: Midnight Theme */}
        <ExampleCard
          title="Midnight Theme"
          description="Dark theme perfect for dashboards"
          code={{
            vanilla: `new LineChart('#chart', {
  data: [
    { x: 'Jan', y: 30 },
    { x: 'Feb', y: 45 },
    { x: 'Mar', y: 38 },
  ],
  theme: 'midnight',
  curve: 'smooth',
}).render();`,
            react: `<LineChart
  data={data}
  theme="midnight"
  curve="smooth"
/>`,
          }}
        >
          <LineChart data={basicLineData} theme="midnight" curve="smooth" />
        </ExampleCard>

        {/* Example 4: Bar Chart */}
        <ExampleCard
          title="Vertical Bar Chart"
          description="Simple vertical bar chart showing quarterly data"
          code={{
            vanilla: `import { BarChart } from '@chartlite/core';

new BarChart('#chart', {
  data: [
    { x: 'Q1', y: 45000 },
    { x: 'Q2', y: 52000 },
    { x: 'Q3', y: 48000 },
    { x: 'Q4', y: 61000 },
  ],
}).render();`,
            react: `import { BarChart } from '@chartlite/react';

<BarChart
  data={[
    { x: 'Q1', y: 45000 },
    { x: 'Q2', y: 52000 },
    { x: 'Q3', y: 48000 },
    { x: 'Q4', y: 61000 },
  ]}
/>`,
          }}
        >
          <BarChart
            data={[
              { x: 'Q1', y: 45000 },
              { x: 'Q2', y: 52000 },
              { x: 'Q3', y: 48000 },
              { x: 'Q4', y: 61000 },
            ]}
          />
        </ExampleCard>

        {/* Example 5: Horizontal Bar Chart */}
        <ExampleCard
          title="Horizontal Bar Chart"
          description="Bar chart with horizontal orientation"
          code={{
            vanilla: `new BarChart('#chart', {
  data: [
    { x: 'Product A', y: 320 },
    { x: 'Product B', y: 280 },
    { x: 'Product C', y: 245 },
  ],
  orientation: 'horizontal',
}).render();`,
            react: `<BarChart
  data={[
    { x: 'Product A', y: 320 },
    { x: 'Product B', y: 280 },
    { x: 'Product C', y: 245 },
  ]}
  orientation="horizontal"
/>`,
          }}
        >
          <BarChart
            data={[
              { x: 'Product A', y: 320 },
              { x: 'Product B', y: 280 },
              { x: 'Product C', y: 245 },
            ]}
            orientation="horizontal"
          />
        </ExampleCard>

        {/* Example 6: Area Chart */}
        <ExampleCard
          title="Area Chart"
          description="Filled area chart with smooth curves"
          code={{
            vanilla: `import { AreaChart } from '@chartlite/core';

new AreaChart('#chart', {
  data: [
    { x: 'Mon', y: 120 },
    { x: 'Tue', y: 150 },
    { x: 'Wed', y: 180 },
    { x: 'Thu', y: 170 },
    { x: 'Fri', y: 200 },
  ],
  curve: 'smooth',
  fillOpacity: 0.3,
}).render();`,
            react: `import { AreaChart } from '@chartlite/react';

<AreaChart
  data={[
    { x: 'Mon', y: 120 },
    { x: 'Tue', y: 150 },
    { x: 'Wed', y: 180 },
    { x: 'Thu', y: 170 },
    { x: 'Fri', y: 200 },
  ]}
  curve="smooth"
  fillOpacity={0.3}
/>`,
          }}
        >
          <AreaChart
            data={[
              { x: 'Mon', y: 120 },
              { x: 'Tue', y: 150 },
              { x: 'Wed', y: 180 },
              { x: 'Thu', y: 170 },
              { x: 'Fri', y: 200 },
            ]}
            curve="smooth"
            fillOpacity={0.3}
          />
        </ExampleCard>
      </div>
    </FrameworkProvider>
  );
}
