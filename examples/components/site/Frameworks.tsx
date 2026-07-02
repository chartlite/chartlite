'use client';

import { useState } from 'react';
import { ComboChart } from '@chartlite/react';
import Reveal from './Reveal';
import { neonOnDark } from './chartTheme';

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
    <section id="frameworks" className="relative mx-auto max-w-6xl px-6 py-24 scroll-mt-24">
      <Reveal className="mb-14 max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-glow-violet">
          Use it anywhere
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-mist-100 sm:text-5xl">
          One core. Every framework.
        </h2>
        <p className="mt-4 text-lg text-mist-500">
          A zero-dependency core with first-party wrappers for React, Vue, and
          Svelte — plus a <span className="text-mist-300">&lt;chart-lite&gt;</span>{' '}
          web component that drops into Angular, Astro, or plain HTML.
        </p>
      </Reveal>

      <Reveal className="grid items-stretch gap-6 lg:grid-cols-2">
        {/* Live chart */}
        <div className="border-glow relative flex flex-col justify-center rounded-2xl glass p-6">
          <div style={neonOnDark}>
            <ComboChart data={comboData} cssVars height={300} />
          </div>
          <p className="mt-2 text-center text-xs text-mist-600">
            The exact chart every snippet renders — live, right here.
          </p>
        </div>

        {/* Tabs + code */}
        <div className="border-glow flex flex-col rounded-2xl glass p-2">
          <div className="flex flex-wrap gap-1 p-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active === t.id
                    ? 'bg-mist-100 text-ink-950'
                    : 'text-mist-500 hover:text-mist-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 pt-2 font-mono text-xs text-mist-600">
            <span className="text-glow-cyan">$</span> npm i {tab.pkg}
          </div>
          <pre className="flex-1 overflow-x-auto rounded-xl p-4 font-mono text-[13px] leading-relaxed text-mist-200">
            <code>{tab.code}</code>
          </pre>
        </div>
      </Reveal>
    </section>
  );
}
