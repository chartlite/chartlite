'use client';

import { useState, type CSSProperties } from 'react';
import { AreaChart } from '@chartlite/react';
import Reveal from './Reveal';

const areaData = {
  series: [
    { name: 'A', dataKey: 'a' },
    { name: 'B', dataKey: 'b' },
  ],
  data: [
    { x: 'Jan', a: 20, b: 12 },
    { x: 'Feb', a: 32, b: 18 },
    { x: 'Mar', a: 27, b: 22 },
    { x: 'Apr', a: 40, b: 26 },
    { x: 'May', a: 52, b: 34 },
    { x: 'Jun', a: 60, b: 40 },
  ],
};

const PALETTES = {
  Aurora: ['#22d3ee', '#a855f7'],
  Sunset: ['#fb923c', '#ec4899'],
  Forest: ['#34d399', '#0d9488'],
  Mono: ['#e5e7eb', '#9ca3af'],
} as const;

type PaletteName = keyof typeof PALETTES;

export default function Theming() {
  const [palette, setPalette] = useState<PaletteName>('Aurora');
  const [light, setLight] = useState(false);

  const [s0, s1] = PALETTES[palette];
  const style = {
    '--cl-series-0': s0,
    '--cl-series-1': s1,
    '--cl-bg': light ? '#ffffff' : 'transparent',
    '--cl-text': light ? '#475569' : '#8b8ba7',
    '--cl-grid': light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)',
    transition: 'background-color .4s',
  } as CSSProperties;

  return (
    <section id="theming" className="relative mx-auto max-w-6xl px-6 py-24 scroll-mt-24">
      <Reveal className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-glow-pink">
            Theme with pure CSS
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-mist-100 sm:text-5xl">
            Re-theme without re-rendering.
          </h2>
          <p className="mt-4 text-lg text-mist-500">
            Pass <span className="font-mono text-mist-300">cssVars</span> and every
            color becomes a CSS custom property. Restyle palettes, or flip
            light/dark, entirely in CSS — no JavaScript, no redraw. Pairs with SSR
            for zero-JS theming.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-mist-600">Palette</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PALETTES) as PaletteName[]).map((name) => (
                  <button
                    key={name}
                    onClick={() => setPalette(name)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      palette === name
                        ? 'border-white/30 text-mist-100'
                        : 'border-white/10 text-mist-500 hover:text-mist-100'
                    }`}
                  >
                    <span className="flex">
                      <span className="h-3 w-3 rounded-full" style={{ background: PALETTES[name][0] }} />
                      <span className="-ml-1 h-3 w-3 rounded-full" style={{ background: PALETTES[name][1] }} />
                    </span>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-mist-600">Mode</p>
              <button
                onClick={() => setLight((v) => !v)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-mist-100 transition-colors hover:border-white/25"
              >
                {light ? '☀ Light' : '☾ Dark'} — click to flip
              </button>
            </div>
          </div>

          <pre className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-ink-900/60 p-4 font-mono text-[12px] leading-relaxed text-mist-400">
            <code>{`.chart {
  --cl-series-0: ${s0};
  --cl-series-1: ${s1};${light ? '\n  --cl-bg: #ffffff;\n  --cl-text: #475569;' : ''}
}`}</code>
          </pre>
        </div>

        <div className="border-glow rounded-2xl glass p-6" style={{ background: light ? 'rgba(255,255,255,0.92)' : undefined }}>
          <div style={style}>
            <AreaChart data={areaData} curve="smooth" cssVars height={340} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
