'use client';

import type { ReactNode } from 'react';
import {
  BarChart,
  ComboChart,
  PieChart,
  RadialChart,
  Sparkline,
  ScatterChart,
  AreaChart,
} from '@chartlite/react';
import Reveal from './Reveal';

function ChartCard({
  title,
  tag,
  children,
}: {
  title: string;
  tag: string;
  children: ReactNode;
}) {
  return (
    <div className="border-glow relative overflow-hidden rounded-2xl glass p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-mist-100">{title}</h3>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mist-500">
          {tag}
        </span>
      </div>
      {children}
    </div>
  );
}

const barData = {
  series: [
    { name: 'Desktop', dataKey: 'd' },
    { name: 'Mobile', dataKey: 'm' },
  ],
  data: [
    { q: 'Q1', d: 44, m: 30 },
    { q: 'Q2', d: 52, m: 41 },
    { q: 'Q3', d: 48, m: 46 },
    { q: 'Q4', d: 61, m: 55 },
  ],
};

const comboData = {
  series: [
    { name: 'Revenue', dataKey: 'revenue', type: 'bar' as const },
    { name: 'Growth', dataKey: 'growth', type: 'line' as const },
  ],
  data: [
    { m: 'Jan', revenue: 42, growth: 12 },
    { m: 'Feb', revenue: 48, growth: 18 },
    { m: 'Mar', revenue: 52, growth: 22 },
    { m: 'Apr', revenue: 49, growth: 16 },
    { m: 'May', revenue: 61, growth: 28 },
    { m: 'Jun', revenue: 72, growth: 34 },
  ],
};

const lineData = [
  { x: 'Mon', y: 20 },
  { x: 'Tue', y: 32 },
  { x: 'Wed', y: 27 },
  { x: 'Thu', y: 40 },
  { x: 'Fri', y: 52 },
  { x: 'Sat', y: 46 },
  { x: 'Sun', y: 60 },
];

const pieData = [
  { x: 'Direct', y: 38 },
  { x: 'Organic', y: 27 },
  { x: 'Referral', y: 18 },
  { x: 'Social', y: 11 },
  { x: 'Email', y: 6 },
];

const scatterData = [
  { x: 12, y: 30 }, { x: 25, y: 45 }, { x: 35, y: 38 }, { x: 48, y: 52 },
  { x: 60, y: 48 }, { x: 75, y: 65 }, { x: 82, y: 58 }, { x: 90, y: 72 },
];

const metrics = [
  { label: 'Revenue', value: '$72.4k', delta: '+34%', data: [12, 15, 13, 18, 22, 19, 25, 24, 28, 30] },
  { label: 'Active users', value: '18.2k', delta: '+12%', data: [8, 9, 11, 10, 13, 15, 14, 17, 19, 21] },
  { label: 'Latency', value: '42ms', delta: '−8%', data: [60, 55, 58, 50, 47, 49, 44, 45, 43, 42] },
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative mx-auto max-w-6xl px-6 py-24 scroll-mt-24">
      <Reveal className="mb-14 max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-glow-cyan">
          Eight chart types
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-mist-100 sm:text-5xl">
          One tiny library, every chart you actually need.
        </h2>
        <p className="mt-4 text-lg text-mist-500">
          Line, bar, area, scatter, pie &amp; donut, radial gauges, sparklines,
          and combo — all live below, and themed entirely with CSS variables (try
          the theme toggle up top).
        </p>
      </Reveal>

      <Reveal stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <ChartCard title="Line & area" tag="line">
          <AreaChart data={lineData} curve="smooth" cssVars height={210} />
        </ChartCard>

        <ChartCard title="Grouped bars" tag="bar">
          <BarChart data={barData} cssVars height={210} />
        </ChartCard>

        <ChartCard title="Combo" tag="combo">
          <ComboChart data={comboData} cssVars height={210} />
        </ChartCard>

        <ChartCard title="Donut" tag="pie">
          <PieChart data={pieData} innerRadius={0.64} cssVars height={210} />
        </ChartCard>

        <ChartCard title="Radial gauge" tag="radial">
          <RadialChart
            data={[{ x: 'Score', y: 74 }]}
            max={100}
            startAngle={-120}
            endAngle={120}
            cssVars
            height={210}
          />
        </ChartCard>

        <ChartCard title="Scatter" tag="scatter">
          <ScatterChart data={scatterData} cssVars height={210} />
        </ChartCard>
      </Reveal>

      {/* Sparkline metric strip */}
      <Reveal className="mt-5">
        <div className="border-glow grid gap-px overflow-hidden rounded-2xl glass sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-2 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest text-mist-600">{m.label}</span>
                <span className="text-xs font-semibold text-glow-cyan">{m.delta}</span>
              </div>
              <span className="font-display text-2xl font-semibold text-mist-100">{m.value}</span>
              <Sparkline data={m.data} type="area" cssVars height={36} />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
