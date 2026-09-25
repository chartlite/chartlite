'use client';

import { useState } from 'react';
import { ComboChart } from '@chartlite/react';
import Reveal from './Reveal';
import SectionHeader from './SectionHeader';

const comboData = {
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

const TABS = [
  {
    id: 'react',
    label: 'React',
    pkg: '@chartlite/react',
    code: `import { ComboChart } from '@chartlite/react';

<ComboChart data={data} />`,
  },
  {
    id: 'vue',
    label: 'Vue',
    pkg: '@chartlite/vue',
    code: `<script setup>
import { ComboChart } from '@chartlite/vue';
</script>

<template>
  <ComboChart :data="data" />
</template>`,
  },
  {
    id: 'svelte',
    label: 'Svelte',
    pkg: '@chartlite/svelte',
    code: `<script>
  import { chart } from '@chartlite/svelte';
</script>

<div use:chart={{ type: 'combo', data }} />`,
  },
  {
    id: 'vanilla',
    label: 'Vanilla',
    pkg: '@chartlite/core',
    code: `import { ComboChart } from '@chartlite/core';

new ComboChart('#chart', { data }).render();`,
  },
  {
    id: 'element',
    label: 'Web Component',
    pkg: '@chartlite/element',
    code: `<script type="module">
  import '@chartlite/element';
</script>

<chart-lite type="combo" data="…"></chart-lite>`,
  },
] as const;

export default function Frameworks() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('react');
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section id="frameworks" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-16 md:py-20">
      <SectionHeader number="§2" kicker="Use it anywhere" title="One core. Every framework.">
        A zero-dependency core with first-party wrappers for React, Vue, and
        Svelte, plus a <span className="font-mono text-[0.9em] text-ink">&lt;chart-lite&gt;</span>{' '}
        web component that drops into Angular, Astro, or plain HTML.
      </SectionHeader>

      <Reveal className="grid items-stretch gap-6 lg:grid-cols-2">
        <figure className="flex flex-col">
          <div className="plate flex flex-1 flex-col justify-center rounded-sm p-6">
            <ComboChart data={comboData} cssVars height={300} />
          </div>
          <figcaption className="mt-3 flex gap-3 text-sm text-muted">
            <span className="shrink-0 whitespace-nowrap pt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink">Fig. 2</span>
            <span className="font-serif text-[15px] italic">The exact chart every snippet on the right renders, live.</span>
          </figcaption>
        </figure>

        <div className="code-plate flex flex-col overflow-hidden rounded-sm">
          <div role="tablist" aria-label="Framework" className="flex flex-wrap gap-x-5 border-b border-slate-line px-5">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={active === t.id}
                onClick={() => setActive(t.id)}
                className={`-mb-px border-b-2 py-3.5 text-sm transition-colors ${
                  active === t.id
                    ? 'border-accent text-slate-text'
                    : 'border-transparent text-slate-muted hover:text-slate-text'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-5 pt-5 font-mono text-xs text-slate-muted">
            <span className="text-accent">$</span> npm i {tab.pkg}
          </div>
          <pre className="flex-1 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
            <code>{tab.code}</code>
          </pre>
        </div>
      </Reveal>
    </section>
  );
}
