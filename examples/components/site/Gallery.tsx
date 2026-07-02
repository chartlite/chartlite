'use client';

import type { ReactNode } from 'react';
import {
  LineChart,
  BarChart,
  ComboChart,
  PieChart,
  RadialChart,
  Sparkline,
  ScatterChart,
  AreaChart,
} from '@chartlite/react';
import Reveal from './Reveal';
import { neonOnDark } from './chartTheme';

function ChartCard({
  title,
  tag,
  children,
  className = '',
}: {
  title: string;
  tag: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-glow group relative overflow-hidden rounded-2xl glass p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-mist-100">{title}</h3>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mist-500">
          {tag}
        </span>
      </div>
      <div style={neonOnDark}>{children}</div>
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(400px_circle_at_var(--x,50%)_var(--y,0%),rgba(34,211,238,0.08),transparent_60%)]" />
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

export default function Gallery() {
  return (
    <section id="gallery" className="relative mx-auto max-w-6xl px-6 py-24 scroll-mt-24">
      <Reveal className="mb-14 max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-glow-cyan">
          Nine chart types
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-mist-100 sm:text-5xl">
          One tiny library, every chart you actually need.
        </h2>
        <p className="mt-4 text-lg text-mist-500">
          Line, bar, area, scatter, pie &amp; donut, radial gauges, sparklines,
          and combo — all rendered live below, themed entirely with CSS variables.
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
          <PieChart data={pieData} innerRadius={0.62} showLabels cssVars height={210} />
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

      <Reveal className="mt-5">
        <div className="border-glow flex flex-col items-start justify-between gap-4 rounded-2xl glass p-6 sm:flex-row sm:items-center">
          <div style={neonOnDark} className="flex flex-1 items-center gap-6">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs text-mist-600">Sparkline · inline metric</p>
              <Sparkline data={[12, 15, 13, 18, 22, 19, 25, 24, 28, 30]} type="area" width={260} height={44} />
            </div>
          </div>
          <a
            href="/chart-gallery"
            className="shrink-0 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-mist-100 transition-colors hover:border-white/25"
          >
            Full gallery →
          </a>
        </div>
      </Reveal>
    </section>
  );
}
