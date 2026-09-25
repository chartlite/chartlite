'use client';

import { useState, type CSSProperties } from 'react';
import { AreaChart } from '@chartlite/react';
import Reveal from './Reveal';
import SectionHeader from './SectionHeader';

const areaData = {
  series: [
    { name: 'Organic', dataKey: 'a' },
    { name: 'Paid', dataKey: 'b' },
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
  Almanac: ['#d4441c', '#0f5e5c'],
  Orchard: ['#5f8a3a', '#d9a21b'],
  Dusk: ['#7b4b6e', '#e07a5f'],
  Graphite: ['#6b6255', '#b5aa98'],
} as const;

type PaletteName = keyof typeof PALETTES;

const MODES = {
  paper: { bg: '#faf7f1', text: '#776d5f', grid: 'rgba(27,24,19,0.09)', border: '#d6ccba' },
  night: { bg: '#1b1814', text: '#978b77', grid: 'rgba(241,234,217,0.08)', border: '#332e27' },
} as const;

type ModeName = keyof typeof MODES;

interface ThemeStyle extends CSSProperties {
  '--cl-series-0': string;
  '--cl-series-1': string;
  '--cl-bg': string;
  '--cl-text': string;
  '--cl-grid': string;
}

function isPaletteName(value: string): value is PaletteName {
  return value in PALETTES;
}

export default function Theming() {
  const [palette, setPalette] = useState<PaletteName>('Almanac');
  const [mode, setMode] = useState<ModeName>('paper');

  const [s0, s1] = PALETTES[palette];
  const m = MODES[mode];
  const style: ThemeStyle = {
    '--cl-series-0': s0,
    '--cl-series-1': s1,
    '--cl-bg': m.bg,
    '--cl-text': m.text,
    '--cl-grid': m.grid,
  };

  return (
    <section id="theming" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-16 md:py-20">
      <SectionHeader
        number="§3"
        kicker="Theme with plain CSS"
        title={
          <>
            Re-theme <em className="text-accent">without</em> re-rendering.
          </>
        }
      >
        Pass <span className="font-mono text-[0.9em] text-ink">cssVars</span> and every
        colour becomes a CSS custom property. Swap palettes or flip light and dark
        in CSS alone, with no JavaScript and no redraw. Combined with server
        rendering, that gives you theming with zero client JS.
      </SectionHeader>

      <Reveal className="grid items-start gap-12 lg:grid-cols-[1fr_1.25fr]">
        <div className="space-y-8">
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Palette</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PALETTES).filter(isPaletteName).map((name) => (
                <button
                  key={name}
                  onClick={() => setPalette(name)}
                  aria-pressed={palette === name}
                  className={`flex items-center gap-3 rounded-sm border px-3 py-2.5 text-left text-sm transition-colors ${
                    palette === name
                      ? 'border-ink bg-paper-raised text-ink'
                      : 'border-rule text-muted hover:border-muted hover:text-ink'
                  }`}
                >
                  <span className="flex">
                    <span className="h-4 w-4 rounded-full ring-2 ring-paper" style={{ background: PALETTES[name][0] }} />
                    <span className="-ml-1.5 h-4 w-4 rounded-full ring-2 ring-paper" style={{ background: PALETTES[name][1] }} />
                  </span>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Mode</p>
            <div className="inline-flex rounded-full border border-rule p-1">
              {(['paper', 'night'] as const).map((name) => (
                <button
                  key={name}
                  onClick={() => setMode(name)}
                  aria-pressed={mode === name}
                  className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
                    mode === name ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <pre className="code-plate overflow-x-auto rounded-sm p-5 font-mono text-[12.5px] leading-relaxed">
            <code>
              <span className="text-slate-muted">.chart {'{'}</span>
              {`\n  --cl-series-0: `}
              <span style={{ color: s0 }}>■</span> {s0};
              {`\n  --cl-series-1: `}
              <span style={{ color: s1 }}>■</span> {s1};
              {`\n  --cl-bg: ${m.bg};\n  --cl-text: ${m.text};\n`}
              <span className="text-slate-muted">{'}'}</span>
            </code>
          </pre>
        </div>

        <figure>
          <div
            className="rounded-sm border p-6 transition-colors duration-500"
            style={{ ...style, background: m.bg, borderColor: m.border }}
          >
            <AreaChart data={areaData} curve="smooth" cssVars height={340} />
          </div>
          <figcaption className="mt-3 flex gap-3 text-sm text-muted">
            <span className="shrink-0 whitespace-nowrap pt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink">Fig. 3</span>
            <span className="font-serif text-[15px] italic">
              One chart instance. Each click changes only the CSS variables on its wrapper.
            </span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
