'use client';

import { useState } from 'react';
import Reveal from './Reveal';

const PACKAGES = [
  '@chartlite/core',
  '@chartlite/react',
  '@chartlite/vue',
  '@chartlite/svelte',
  '@chartlite/element',
  '@chartlite/mcp',
];

export default function Install() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText('npm i @chartlite/core');
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
      <Reveal>
        <div className="border-t border-ink pt-16 text-center">
          <p className="kicker">Ready in one line</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-[1.02] tracking-[-0.01em] text-ink sm:text-7xl">
            Ship a chart <em className="text-accent">before</em> your coffee cools.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            Zero dependencies, about 15&nbsp;KB gzipped, MIT licensed. Pick your
            framework and go.
          </p>

          <button
            onClick={copy}
            className="code-plate group mx-auto mt-10 flex items-center gap-4 rounded-lg px-6 py-4 font-mono text-base transition-transform hover:-translate-y-0.5 sm:text-lg"
          >
            <span className="text-accent">$</span> npm i @chartlite/core
            <span className="text-sm text-slate-muted transition-colors group-hover:text-slate-text">
              {copied ? '✓ copied' : 'copy'}
            </span>
          </button>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.npmjs.com/package/@chartlite/core"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
            >
              View on npm
            </a>
            <a
              href="https://github.com/chartlite/chartlite"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent-ink"
            >
              Star on GitHub
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-muted">
            {PACKAGES.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
