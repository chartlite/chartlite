'use client';

import { ScatterChart } from '@chartlite/react';
import ExampleCard from '@/components/ExampleCard';
import { FrameworkProvider } from '@/components/FrameworkContext';

export default function ScatterPlots() {
  const basicScatterData = [
    { x: 10, y: 30 },
    { x: 25, y: 45 },
    { x: 35, y: 38 },
    { x: 48, y: 52 },
    { x: 60, y: 48 },
    { x: 75, y: 65 },
  ];

  const labeledScatterData = [
    { x: 10, y: 30, label: 'Start' },
    { x: 25, y: 45, label: 'Rise' },
    { x: 35, y: 38, label: 'Dip' },
    { x: 48, y: 52, label: 'Peak' },
    { x: 60, y: 48, label: 'Decline' },
    { x: 75, y: 65, label: 'End' },
  ];

  const multiSeriesData = {
    series: [
      { name: 'Group A', dataKey: 'groupA' },
      { name: 'Group B', dataKey: 'groupB' },
      { name: 'Group C', dataKey: 'groupC' },
    ],
    data: [
      { x: 10, groupA: 30, groupB: 45, groupC: 25 },
      { x: 20, groupA: 35, groupB: 40, groupC: 30 },
      { x: 30, groupA: 40, groupB: 50, groupC: 28 },
      { x: 40, groupA: 42, groupB: 48, groupC: 35 },
      { x: 50, groupA: 48, groupB: 55, groupC: 40 },
      { x: 60, groupA: 52, groupB: 60, groupC: 38 },
    ],
  };

  const labeledMultiSeriesData = {
    series: [
      { name: 'Series 1', dataKey: 'series1', color: '#3b82f6' },
      { name: 'Series 2', dataKey: 'series2', color: '#10b981' },
    ],
    data: [
      { x: 15, series1: 35, series2: 50, label: 'Q1' },
      { x: 35, series1: 42, series2: 45, label: 'Q2' },
      { x: 55, series1: 50, series2: 55, label: 'Q3' },
      { x: 75, series1: 60, series2: 65, label: 'Q4' },
    ],
  };

  return (
    <FrameworkProvider>
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          🎯 Scatter Plots
        </h1>
        <p className="text-xl text-white/90">
          Explore scatter charts with point labels, different shapes, and multi-series support
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Example 1: Basic Scatter Plot */}
        <ExampleCard
          title="Basic Scatter Plot"
          description="Simple scatter chart with default circular points"
          code={{
            vanilla: `import { ScatterChart } from '@chartlite/core';

new ScatterChart('#chart', {
  data: [
    { x: 10, y: 30 },
    { x: 25, y: 45 },
    { x: 35, y: 38 },
    { x: 48, y: 52 },
    { x: 60, y: 48 },
    { x: 75, y: 65 },
  ],
}).render();`,
            react: `import { ScatterChart } from '@chartlite/react';

function Chart() {
  const data = [
    { x: 10, y: 30 },
    { x: 25, y: 45 },
    { x: 35, y: 38 },
    { x: 48, y: 52 },
    { x: 60, y: 48 },
    { x: 75, y: 65 },
  ];

  return <ScatterChart data={data} />;
}`,
          }}
        >
          <ScatterChart data={basicScatterData} />
        </ExampleCard>

        {/* Example 2: Scatter Plot with Labels */}
        <ExampleCard
          title="Scatter Plot with Point Labels"
          description="Add labels to points to identify key data points"
          code={{
            vanilla: `new ScatterChart('#chart', {
  data: [
    { x: 10, y: 30, label: 'Start' },
    { x: 25, y: 45, label: 'Rise' },
    { x: 35, y: 38, label: 'Dip' },
    { x: 48, y: 52, label: 'Peak' },
    { x: 60, y: 48, label: 'Decline' },
    { x: 75, y: 65, label: 'End' },
  ],
  showLabels: true,
}).render();`,
            react: `<ScatterChart
  data={[
    { x: 10, y: 30, label: 'Start' },
    { x: 25, y: 45, label: 'Rise' },
    { x: 35, y: 38, label: 'Dip' },
    { x: 48, y: 52, label: 'Peak' },
    { x: 60, y: 48, label: 'Decline' },
    { x: 75, y: 65, label: 'End' },
  ]}
  showLabels={true}
/>`,
          }}
        >
          <ScatterChart data={labeledScatterData} showLabels={true} />
        </ExampleCard>

        {/* Example 3: Different Point Shapes */}
        <ExampleCard
          title="Square Points"
          description="Change point shape to squares with larger size"
          code={{
            vanilla: `new ScatterChart('#chart', {
  data: [
    { x: 10, y: 30 },
    { x: 25, y: 45 },
    { x: 35, y: 38 },
  ],
  pointShape: 'square',
  pointSize: 8,
}).render();`,
            react: `<ScatterChart
  data={data}
  pointShape="square"
  pointSize={8}
/>`,
          }}
        >
          <ScatterChart data={basicScatterData} pointShape="square" pointSize={8} />
        </ExampleCard>

        {/* Example 4: Triangle Points */}
        <ExampleCard
          title="Triangle Points"
          description="Use triangle shapes for a different visual style"
          code={{
            vanilla: `new ScatterChart('#chart', {
  data: [
    { x: 10, y: 30 },
    { x: 25, y: 45 },
    { x: 35, y: 38 },
  ],
  pointShape: 'triangle',
  pointSize: 7,
  theme: 'midnight',
}).render();`,
            react: `<ScatterChart
  data={data}
  pointShape="triangle"
  pointSize={7}
  theme="midnight"
/>`,
          }}
        >
          <ScatterChart
            data={basicScatterData}
            pointShape="triangle"
            pointSize={7}
            theme="midnight"
          />
        </ExampleCard>

        {/* Example 5: Multi-Series Scatter Plot */}
        <ExampleCard
          title="Multi-Series Scatter Plot"
          description="Display multiple groups of data points with auto-assigned colors and legend"
          code={{
            vanilla: `new ScatterChart('#chart', {
  data: {
    series: [
      { name: 'Group A', dataKey: 'groupA' },
      { name: 'Group B', dataKey: 'groupB' },
      { name: 'Group C', dataKey: 'groupC' },
    ],
    data: [
      { x: 10, groupA: 30, groupB: 45, groupC: 25 },
      { x: 20, groupA: 35, groupB: 40, groupC: 30 },
      { x: 30, groupA: 40, groupB: 50, groupC: 28 },
      { x: 40, groupA: 42, groupB: 48, groupC: 35 },
      { x: 50, groupA: 48, groupB: 55, groupC: 40 },
      { x: 60, groupA: 52, groupB: 60, groupC: 38 },
    ],
  },
  showLegend: true,
  title: 'Multi-Group Analysis',
}).render();`,
            react: `<ScatterChart
  data={{
    series: [
      { name: 'Group A', dataKey: 'groupA' },
      { name: 'Group B', dataKey: 'groupB' },
      { name: 'Group C', dataKey: 'groupC' },
    ],
    data: [
      { x: 10, groupA: 30, groupB: 45, groupC: 25 },
      { x: 20, groupA: 35, groupB: 40, groupC: 30 },
      { x: 30, groupA: 40, groupB: 50, groupC: 28 },
      { x: 40, groupA: 42, groupB: 48, groupC: 35 },
      { x: 50, groupA: 48, groupB: 55, groupC: 40 },
      { x: 60, groupA: 52, groupB: 60, groupC: 38 },
    ],
  }}
  showLegend={true}
  title="Multi-Group Analysis"
/>`,
          }}
        >
          <ScatterChart
            data={multiSeriesData}
            showLegend={true}
            title="Multi-Group Analysis"
          />
        </ExampleCard>

        {/* Example 6: Multi-Series with Labels */}
        <ExampleCard
          title="Multi-Series with Quarterly Labels"
          description="Combine multi-series data with point labels for comprehensive data visualization"
          code={{
            vanilla: `new ScatterChart('#chart', {
  data: {
    series: [
      { name: 'Series 1', dataKey: 'series1', color: '#3b82f6' },
      { name: 'Series 2', dataKey: 'series2', color: '#10b981' },
    ],
    data: [
      { x: 15, series1: 35, series2: 50, label: 'Q1' },
      { x: 35, series1: 42, series2: 45, label: 'Q2' },
      { x: 55, series1: 50, series2: 55, label: 'Q3' },
      { x: 75, series1: 60, series2: 65, label: 'Q4' },
    ],
  },
  showLabels: true,
  showLegend: true,
  pointSize: 7,
  title: 'Quarterly Performance',
}).render();`,
            react: `<ScatterChart
  data={{
    series: [
      { name: 'Series 1', dataKey: 'series1', color: '#3b82f6' },
      { name: 'Series 2', dataKey: 'series2', color: '#10b981' },
    ],
    data: [
      { x: 15, series1: 35, series2: 50, label: 'Q1' },
      { x: 35, series1: 42, series2: 45, label: 'Q2' },
      { x: 55, series1: 50, series2: 55, label: 'Q3' },
      { x: 75, series1: 60, series2: 65, label: 'Q4' },
    ],
  }}
  showLabels={true}
  showLegend={true}
  pointSize={7}
  title="Quarterly Performance"
/>`,
          }}
        >
          <ScatterChart
            data={labeledMultiSeriesData}
            showLabels={true}
            showLegend={true}
            pointSize={7}
            title="Quarterly Performance"
          />
        </ExampleCard>

        {/* Example 7: Custom Label Positioning */}
        <ExampleCard
          title="Label Position Control"
          description="Position labels on the right side of points"
          code={{
            vanilla: `new ScatterChart('#chart', {
  data: [
    { x: 20, y: 40, label: 'Point A' },
    { x: 40, y: 55, label: 'Point B' },
    { x: 60, y: 45, label: 'Point C' },
  ],
  showLabels: true,
  labelPosition: 'right',
  labelOffset: 12,
}).render();`,
            react: `<ScatterChart
  data={[
    { x: 20, y: 40, label: 'Point A' },
    { x: 40, y: 55, label: 'Point B' },
    { x: 60, y: 45, label: 'Point C' },
  ]}
  showLabels={true}
  labelPosition="right"
  labelOffset={12}
/>`,
          }}
        >
          <ScatterChart
            data={[
              { x: 20, y: 40, label: 'Point A' },
              { x: 40, y: 55, label: 'Point B' },
              { x: 60, y: 45, label: 'Point C' },
            ]}
            showLabels={true}
            labelPosition="right"
            labelOffset={12}
          />
        </ExampleCard>
      </div>
    </FrameworkProvider>
  );
}
