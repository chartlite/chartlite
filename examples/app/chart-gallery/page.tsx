'use client';

import { PieChart, RadialChart, Sparkline, ComboChart } from '@chartlite/react';
import ExampleCard from '@/components/ExampleCard';
import { FrameworkProvider } from '@/components/FrameworkContext';

export default function ChartGallery() {
  const pieData = [
    { x: 'Direct', y: 38 },
    { x: 'Organic', y: 27 },
    { x: 'Referral', y: 18 },
    { x: 'Social', y: 11 },
    { x: 'Email', y: 6 },
  ];

  const gaugeData = [{ x: 'Score', y: 72 }];

  const kpiData = [
    { x: 'CPU', y: 80 },
    { x: 'Memory', y: 55 },
    { x: 'Disk', y: 30 },
  ];

  const sparkData = [12, 15, 13, 18, 22, 19, 25, 24, 28, 30];

  const comboData = {
    series: [
      { name: 'Revenue', dataKey: 'revenue', type: 'bar' as const },
      { name: 'Growth %', dataKey: 'growth', type: 'line' as const },
    ],
    data: [
      { month: 'Jan', revenue: 4200, growth: 12 },
      { month: 'Feb', revenue: 4800, growth: 18 },
      { month: 'Mar', revenue: 5200, growth: 22 },
      { month: 'Apr', revenue: 4900, growth: 16 },
      { month: 'May', revenue: 6100, growth: 28 },
      { month: 'Jun', revenue: 7200, growth: 34 },
    ],
  };

  return (
    <FrameworkProvider>
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          🎨 Chart Gallery
        </h1>
        <p className="text-xl text-white/90">
          Pie &amp; donut, radial gauges, sparklines, and combo charts — with
          React, Vue, and Svelte snippets
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Pie */}
        <ExampleCard
          title="Pie Chart"
          description="Categorical breakdown as angular slices, each a focusable, screen-reader-labelled segment"
          badge="new"
          code={{
            vanilla: `import { PieChart } from '@chartlite/core';

new PieChart('#chart', {
  data: [
    { x: 'Direct', y: 38 },
    { x: 'Organic', y: 27 },
    { x: 'Referral', y: 18 },
    { x: 'Social', y: 11 },
    { x: 'Email', y: 6 },
  ],
  showLabels: true,
}).render();`,
            react: `import { PieChart } from '@chartlite/react';

<PieChart data={data} showLabels />`,
            vue: `<script setup>
import { PieChart } from '@chartlite/vue';
</script>

<template>
  <PieChart :data="data" show-labels />
</template>`,
            svelte: `<script>
  import { chart } from '@chartlite/svelte';
</script>

<div use:chart={{ type: 'pie', data, showLabels: true }} />`,
          }}
        >
          <PieChart data={pieData} showLabels />
        </ExampleCard>

        {/* Donut */}
        <ExampleCard
          title="Donut Chart"
          description="A pie with an inner radius — set innerRadius (0–1)"
          code={{
            vanilla: `new PieChart('#chart', {
  data,
  innerRadius: 0.6,
  showLabels: true,
}).render();`,
            react: `<PieChart data={data} innerRadius={0.6} showLabels />`,
            vue: `<PieChart :data="data" :inner-radius="0.6" show-labels />`,
            svelte: `<div use:chart={{ type: 'pie', data, innerRadius: 0.6, showLabels: true }} />`,
          }}
        >
          <PieChart data={pieData} innerRadius={0.6} showLabels />
        </ExampleCard>

        {/* Radial gauge */}
        <ExampleCard
          title="Radial Gauge"
          description="A single value as a gauge sweep — great for KPIs and scores"
          badge="new"
          code={{
            vanilla: `import { RadialChart } from '@chartlite/core';

new RadialChart('#chart', {
  data: [{ x: 'Score', y: 72 }],
  max: 100,
  startAngle: -120,
  endAngle: 120,
}).render();`,
            react: `import { RadialChart } from '@chartlite/react';

<RadialChart
  data={[{ x: 'Score', y: 72 }]}
  max={100}
  startAngle={-120}
  endAngle={120}
/>`,
            vue: `<RadialChart
  :data="[{ x: 'Score', y: 72 }]"
  :max="100"
  :start-angle="-120"
  :end-angle="120"
/>`,
            svelte: `<div use:chart={{
  type: 'radial',
  data: [{ x: 'Score', y: 72 }],
  max: 100,
  startAngle: -120,
  endAngle: 120,
}} />`,
          }}
        >
          <RadialChart data={gaugeData} max={100} startAngle={-120} endAngle={120} />
        </ExampleCard>

        {/* Radial rings */}
        <ExampleCard
          title="Radial Progress Rings"
          description="Multiple values as concentric rings — a compact multi-metric readout"
          code={{
            vanilla: `new RadialChart('#chart', {
  data: [
    { x: 'CPU', y: 80 },
    { x: 'Memory', y: 55 },
    { x: 'Disk', y: 30 },
  ],
  max: 100,
}).render();`,
            react: `<RadialChart data={kpiData} max={100} />`,
            vue: `<RadialChart :data="kpiData" :max="100" />`,
            svelte: `<div use:chart={{ type: 'radial', data: kpiData, max: 100 }} />`,
          }}
        >
          <RadialChart data={kpiData} max={100} />
        </ExampleCard>

        {/* Sparkline */}
        <ExampleCard
          title="Sparkline"
          description="A tiny, axis-less inline chart for live metrics — line or filled area"
          badge="new"
          code={{
            vanilla: `import { Sparkline } from '@chartlite/core';

new Sparkline('#chart', {
  data: [12, 15, 13, 18, 22, 19, 25, 24, 28, 30],
  type: 'area',
}).render();`,
            react: `import { Sparkline } from '@chartlite/react';

<Sparkline data={data} type="area" />`,
            vue: `<Sparkline :data="data" type="area" />`,
            svelte: `<div use:chart={{ type: 'sparkline', data, type: 'area' }} />`,
          }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-gray-700 font-medium">Revenue</span>
            <Sparkline data={sparkData} />
            <Sparkline data={sparkData} type="area" />
          </div>
        </ExampleCard>

        {/* Combo */}
        <ExampleCard
          title="Combo Chart"
          description="Mix bars and a trend line on one set of axes — each series declares its own type"
          badge="new"
          code={{
            vanilla: `import { ComboChart } from '@chartlite/core';

new ComboChart('#chart', {
  data: {
    series: [
      { name: 'Revenue', dataKey: 'revenue', type: 'bar' },
      { name: 'Growth %', dataKey: 'growth', type: 'line' },
    ],
    data: [
      { month: 'Jan', revenue: 4200, growth: 12 },
      { month: 'Feb', revenue: 4800, growth: 18 },
      { month: 'Mar', revenue: 5200, growth: 22 },
    ],
  },
}).render();`,
            react: `import { ComboChart } from '@chartlite/react';

<ComboChart data={comboData} />`,
            vue: `<ComboChart :data="comboData" />`,
            svelte: `<div use:chart={{ type: 'combo', data: comboData }} />`,
          }}
        >
          <ComboChart data={comboData} />
        </ExampleCard>
      </div>
    </FrameworkProvider>
  );
}
