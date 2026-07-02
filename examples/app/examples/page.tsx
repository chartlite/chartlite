'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  PieChart,
  RadialChart,
  ComboChart,
} from '@chartlite/react';
import ExampleCard from '@/components/ExampleCard';
import { FrameworkProvider } from '@/components/FrameworkContext';

const SECTIONS = [
  { id: 'types', label: 'Chart types' },
  { id: 'data', label: 'Data formats' },
  { id: 'multi', label: 'Multi-series' },
  { id: 'interactivity', label: 'Interactivity' },
  { id: 'performance', label: 'Performance' },
];

function SectionHeading({ id, kicker, title, blurb }: { id: string; kicker: string; title: string; blurb: string }) {
  return (
    <div id={id} className="mb-8 max-w-2xl scroll-mt-44">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-glow-cyan">{kicker}</p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-mist-100 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-mist-500">{blurb}</p>
    </div>
  );
}

/** A gentle, smooth live-updating chart demonstrating element pooling. */
function PerfDemo() {
  const [data, setData] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({ x: `${i}`, y: 40 + Math.round(18 * Math.sin(i / 2)) }))
  );

  useEffect(() => {
    let v = 50;
    const id = setInterval(() => {
      setData((prev) => {
        v = Math.max(12, Math.min(88, v + (Math.random() - 0.5) * 14));
        const next = prev.slice(1);
        next.push({ x: `${Number(prev[prev.length - 1].x) + 1}`, y: Math.round(v) });
        return next;
      });
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return <LineChart data={data} curve="smooth" showPoints={false} animate={false} cssVars height={280} />;
}

export default function Examples() {
  const barData = {
    series: [
      { name: 'Desktop', dataKey: 'desktop' },
      { name: 'Mobile', dataKey: 'mobile' },
    ],
    data: [
      { q: 'Q1', desktop: 45, mobile: 30 },
      { q: 'Q2', desktop: 52, mobile: 41 },
      { q: 'Q3', desktop: 48, mobile: 46 },
      { q: 'Q4', desktop: 61, mobile: 55 },
    ],
  };

  const combo = {
    series: [
      { name: 'Revenue', dataKey: 'revenue', type: 'bar' as const },
      { name: 'Growth', dataKey: 'growth', type: 'line' as const },
    ],
    data: [
      { m: 'Jan', revenue: 42, growth: 12 },
      { m: 'Feb', revenue: 48, growth: 18 },
      { m: 'Mar', revenue: 52, growth: 22 },
      { m: 'Apr', revenue: 61, growth: 28 },
      { m: 'May', revenue: 72, growth: 34 },
    ],
  };

  const lineData = [
    { x: 'Jan', y: 30 }, { x: 'Feb', y: 45 }, { x: 'Mar', y: 38 },
    { x: 'Apr', y: 52 }, { x: 'May', y: 48 }, { x: 'Jun', y: 61 },
  ];

  return (
    <FrameworkProvider>
      <header className="mb-10 max-w-3xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-mist-100 sm:text-5xl">
          Examples
        </h1>
        <p className="mt-4 text-lg text-mist-500">
          Every chart type, all four data formats, multi-series, interactivity, and
          performance — live, with copy-paste code for <span className="text-mist-300">every framework</span>.
          Flip the chart theme from the nav to see it all re-theme at once.
        </p>
      </header>

      {/* sticky section nav (opaque so headings don't bleed through) */}
      <nav className="sticky top-24 z-30 mb-12 -mx-2 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-ink-950/90 px-2 py-2 backdrop-blur-xl">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-lg px-3 py-1.5 text-sm text-mist-500 transition-colors hover:text-mist-100"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Chart types */}
      <SectionHeading id="types" kicker="Nine types" title="Every chart type" blurb="Line, bar, area, scatter, pie & donut, radial gauge, and combo — one API, one theme system, and every wrapper supports all of them." />
      <div className="grid grid-cols-1 gap-8">
        <ExampleCard
          title="Line & area"
          description="Smooth or linear curves, optional points, gradient area fills."
          code={{
            vanilla: `import { AreaChart } from '@chartlite/core';\n\nnew AreaChart('#chart', { data, curve: 'smooth' }).render();`,
            react: `import { AreaChart } from '@chartlite/react';\n\n<AreaChart data={data} curve="smooth" />`,
            vue: `<script setup>\nimport { AreaChart } from '@chartlite/vue';\n</script>\n\n<AreaChart :data="data" curve="smooth" />`,
            svelte: `<script>\n  import { chart } from '@chartlite/svelte';\n</script>\n\n<div use:chart={{ type: 'area', data, curve: 'smooth' }} />`,
          }}
        >
          <AreaChart data={lineData} curve="smooth" cssVars height={260} />
        </ExampleCard>

        <ExampleCard
          title="Bar & combo"
          description="Grouped or stacked bars, and combo charts that mix bars with a trend line."
          code={{
            vanilla: `import { ComboChart } from '@chartlite/core';\n\nnew ComboChart('#chart', { data: comboData }).render();`,
            react: `import { ComboChart } from '@chartlite/react';\n\n<ComboChart data={comboData} />`,
            vue: `<script setup>\nimport { ComboChart } from '@chartlite/vue';\n</script>\n\n<ComboChart :data="comboData" />`,
            svelte: `<script>\n  import { chart } from '@chartlite/svelte';\n</script>\n\n<div use:chart={{ type: 'combo', data: comboData }} />`,
          }}
        >
          <ComboChart data={combo} cssVars height={260} />
        </ExampleCard>

        <ExampleCard
          title="Pie, donut & radial"
          description="Categorical breakdowns and radial gauges for KPIs and scores."
          code={{
            vanilla: `import { RadialChart } from '@chartlite/core';\n\nnew RadialChart('#chart', {\n  data: [{ x: 'Score', y: 74 }],\n  max: 100, startAngle: -120, endAngle: 120,\n}).render();`,
            react: `import { RadialChart } from '@chartlite/react';\n\n<RadialChart data={[{ x: 'Score', y: 74 }]} max={100} startAngle={-120} endAngle={120} />`,
            vue: `<script setup>\nimport { RadialChart } from '@chartlite/vue';\n</script>\n\n<RadialChart :data="[{ x: 'Score', y: 74 }]" :max="100" :start-angle="-120" :end-angle="120" />`,
            svelte: `<div use:chart={{\n  type: 'radial',\n  data: [{ x: 'Score', y: 74 }],\n  max: 100, startAngle: -120, endAngle: 120,\n}} />`,
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <PieChart data={[{ x: 'A', y: 38 }, { x: 'B', y: 27 }, { x: 'C', y: 20 }, { x: 'D', y: 15 }]} innerRadius={0.6} cssVars height={240} />
            <RadialChart data={[{ x: 'Score', y: 74 }]} max={100} startAngle={-120} endAngle={120} cssVars height={240} />
          </div>
        </ExampleCard>

        <ExampleCard
          title="Scatter"
          description="Numeric x/y points with configurable shape, size, and labels."
          code={{
            vanilla: `import { ScatterChart } from '@chartlite/core';\n\nnew ScatterChart('#chart', { data }).render();`,
            react: `import { ScatterChart } from '@chartlite/react';\n\n<ScatterChart data={data} />`,
            vue: `<script setup>\nimport { ScatterChart } from '@chartlite/vue';\n</script>\n\n<ScatterChart :data="data" />`,
            svelte: `<script>\n  import { chart } from '@chartlite/svelte';\n</script>\n\n<div use:chart={{ type: 'scatter', data }} />`,
          }}
        >
          <ScatterChart data={[{ x: 12, y: 30 }, { x: 25, y: 45 }, { x: 35, y: 38 }, { x: 48, y: 52 }, { x: 60, y: 48 }, { x: 75, y: 65 }, { x: 88, y: 72 }]} cssVars height={260} />
        </ExampleCard>
      </div>

      {/* Data formats */}
      <div className="mt-20">
        <SectionHeading id="data" kicker="Flexible input" title="Four data formats" blurb="Pass whatever shape your data is already in — Chartlite normalizes all four, in every framework." />
        <div className="grid grid-cols-1 gap-8">
          <ExampleCard
            title="DataPoint[] & number[]"
            description="The classic [{ x, y }] array, or a bare number[] for quick charts."
            code={{
              vanilla: `import { LineChart } from '@chartlite/core';\n\nnew LineChart('#chart', { data: [30, 45, 38, 52, 48] }).render();`,
              react: `<LineChart data={[30, 45, 38, 52, 48]} />`,
              vue: `<LineChart :data="[30, 45, 38, 52, 48]" />`,
              svelte: `<div use:chart={{ type: 'line', data: [30, 45, 38, 52, 48] }} />`,
            }}
          >
            <LineChart data={[30, 45, 38, 52, 48, 61]} cssVars height={240} />
          </ExampleCard>

          <ExampleCard
            title="Column-oriented & series-first"
            description="DataFrame-style { x: [...], y: [...] }, or series-first for multi-series."
            code={{
              vanilla: `new BarChart('#chart', {\n  data: { x: ['Q1','Q2','Q3','Q4'], y: [45, 52, 48, 61] },\n}).render();`,
              react: `<BarChart data={{ x: ['Q1','Q2','Q3','Q4'], y: [45, 52, 48, 61] }} />`,
              vue: `<BarChart :data="{ x: ['Q1','Q2','Q3','Q4'], y: [45, 52, 48, 61] }" />`,
              svelte: `<div use:chart={{ type: 'bar', data: { x: ['Q1','Q2','Q3','Q4'], y: [45, 52, 48, 61] } }} />`,
            }}
          >
            <BarChart data={{ x: ['Q1', 'Q2', 'Q3', 'Q4'], y: [45, 52, 48, 61] }} cssVars height={240} />
          </ExampleCard>
        </div>
      </div>

      {/* Multi-series */}
      <div className="mt-20">
        <SectionHeading id="multi" kicker="Multiple datasets" title="Multi-series & legends" blurb="Grouped bars, multi-line, and stacked areas with auto colors and a configurable legend." />
        <div className="grid grid-cols-1 gap-8">
          <ExampleCard
            title="Grouped bars with legend"
            description="Series-first data renders grouped bars with an automatic legend."
            code={{
              vanilla: `new BarChart('#chart', { data: seriesFirstData, legend: { show: true } }).render();`,
              react: `<BarChart data={data} legend={{ show: true }} />`,
              vue: `<BarChart :data="data" :legend="{ show: true }" />`,
              svelte: `<div use:chart={{ type: 'bar', data, legend: { show: true } }} />`,
            }}
          >
            <BarChart data={barData} legend={{ show: true }} cssVars height={260} />
          </ExampleCard>
        </div>
      </div>

      {/* Interactivity */}
      <div className="mt-20">
        <SectionHeading id="interactivity" kicker="Overlays" title="Reference lines & annotations" blurb="Draw thresholds, highlight regions, and annotate points — all declaratively, in any framework." />
        <div className="grid grid-cols-1 gap-8">
          <ExampleCard
            title="Reference line"
            description="Mark a goal or threshold with a labelled reference line."
            code={{
              vanilla: `new LineChart('#chart', {\n  data,\n  referenceLines: [{ axis: 'y', value: 50, label: 'Goal' }],\n}).render();`,
              react: `<LineChart data={data} referenceLines={[{ axis: 'y', value: 50, label: 'Goal' }]} />`,
              vue: `<LineChart :data="data" :reference-lines="[{ axis: 'y', value: 50, label: 'Goal' }]" />`,
              svelte: `<div use:chart={{ type: 'line', data,\n  referenceLines: [{ axis: 'y', value: 50, label: 'Goal' }] }} />`,
            }}
          >
            <LineChart data={lineData} curve="smooth" referenceLines={[{ axis: 'y', value: 50, label: 'Goal' }]} cssVars height={260} />
          </ExampleCard>
        </div>
      </div>

      {/* Performance */}
      <div className="mt-20">
        <SectionHeading id="performance" kicker="Fast by default" title="Live updates & element pooling" blurb="Chartlite reuses DOM elements between renders (element pooling) for smooth, allocation-free updates. This chart updates every ~1s." />
        <div className="grid grid-cols-1 gap-8">
          <ExampleCard
            title="Streaming line (element pooling)"
            description="A rolling window updated on an interval — no flicker, no churn."
            code={{
              vanilla: `const chart = new LineChart('#chart', { data, curve: 'smooth' });\nchart.render();\n\nsetInterval(() => chart.update(nextWindow()), 1000);`,
              react: `const [data, setData] = useState(seed);\nuseEffect(() => {\n  const id = setInterval(() => setData(roll), 1000);\n  return () => clearInterval(id);\n}, []);\n\n<LineChart data={data} curve="smooth" animate={false} />`,
              vue: `const data = ref(seed);\nonMounted(() => {\n  const id = setInterval(() => data.value = roll(data.value), 1000);\n  onUnmounted(() => clearInterval(id));\n});\n\n<LineChart :data="data" curve="smooth" :animate="false" />`,
              svelte: `let data = seed;\nonMount(() => {\n  const id = setInterval(() => data = roll(data), 1000);\n  return () => clearInterval(id);\n});\n\n<div use:chart={{ type: 'line', data, curve: 'smooth', animate: false }} />`,
            }}
          >
            <PerfDemo />
          </ExampleCard>
        </div>
      </div>
    </FrameworkProvider>
  );
}
