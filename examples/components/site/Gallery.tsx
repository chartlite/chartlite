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
import SectionHeader from './SectionHeader';

function Plate({
  numeral,
  title,
  tag,
  caption,
  children,
}: {
  numeral: string;
  title: string;
  tag: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="group flex flex-col">
      <div className="plate flex-1 rounded-sm p-5 transition-transform duration-500 group-hover:-translate-y-1">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-serif text-2xl text-ink">{title}</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{tag}</span>
        </div>
        {children}
      </div>
      <figcaption className="mt-3 flex gap-3 text-sm text-muted">
        <span className="shrink-0 whitespace-nowrap pt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink">Pl. {numeral}</span>
        <span className="font-serif text-[15px] italic leading-snug">{caption}</span>
      </figcaption>
    </figure>
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
  { label: 'Revenue', value: '$72.4k', delta: '+34%', up: true, data: [12, 15, 13, 18, 22, 19, 25, 24, 28, 30] },
  { label: 'Active users', value: '18.2k', delta: '+12%', up: true, data: [8, 9, 11, 10, 13, 15, 14, 17, 19, 21] },
  { label: 'p95 latency', value: '42ms', delta: '−8%', up: false, data: [60, 55, 58, 50, 47, 49, 44, 45, 43, 42] },
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-16 md:py-20">
      <SectionHeader
        number="§1"
        kicker="Eight chart types"
        title={
          <>
            Every chart you <em className="text-accent">actually</em> need, and nothing you don&rsquo;t.
          </>
        }
      >
        Line, bar, area, scatter, pie &amp; donut, radial gauges, sparklines, and
        combo. Everything below is live and themed only with CSS variables, so
        switching between Paper and Night in the nav re-colours all of it without
        a redraw.
      </SectionHeader>

      <Reveal stagger className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        <Plate numeral="I" title="Area" tag="area" caption="Monotone smoothing never overshoots the data; one series gets a gradient.">
          <AreaChart data={lineData} curve="smooth" cssVars height={210} />
        </Plate>

        <Plate numeral="II" title="Grouped bars" tag="bar" caption="Side-by-side bars with a thickness cap and a legend that appears on its own.">
          <BarChart data={barData} cssVars height={210} />
        </Plate>

        <Plate numeral="III" title="Combo" tag="combo" caption="Bars and a trend line on shared axes, from one row-shaped dataset.">
          <ComboChart data={comboData} cssVars height={210} />
        </Plate>

        <Plate numeral="IV" title="Donut" tag="pie" caption="Percentages are printed only on slices wide enough to hold them.">
          <PieChart data={pieData} innerRadius={0.64} cssVars height={210} />
        </Plate>

        <Plate numeral="V" title="Radial gauge" tag="radial" caption="Progress rings and gauges with rounded caps and any start/end angle.">
          <RadialChart
            data={[{ x: 'Score', y: 74 }]}
            max={100}
            startAngle={-120}
            endAngle={120}
            cssVars
            height={210}
          />
        </Plate>

        <Plate numeral="VI" title="Scatter" tag="scatter" caption="Numeric x and y with nice ticks, and configurable point shape and size.">
          <ScatterChart data={scatterData} cssVars height={210} />
        </Plate>
      </Reveal>

      {/* Sparkline ticker */}
      <Reveal className="mt-14">
        <div className="grid border-y border-ink sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-2 border-rule p-5 sm:border-r sm:last:border-r-0 sm:first:pl-0">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{m.label}</span>
                <span className={`font-mono text-xs ${m.up ? 'text-teal' : 'text-accent-ink'}`}>{m.delta}</span>
              </div>
              <span className="font-serif text-4xl leading-none text-ink">{m.value}</span>
              <Sparkline data={m.data} type="area" cssVars width={260} height={40} />
            </div>
          ))}
        </div>
        <p className="mt-3 flex gap-3 text-sm text-muted">
          <span className="shrink-0 whitespace-nowrap pt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink">Pl. VII</span>
          <span className="font-serif text-[15px] italic">Sparklines: axis-less inline trends for metric strips and tables.</span>
        </p>
      </Reveal>
    </section>
  );
}
