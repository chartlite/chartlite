'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AreaChart } from '@chartlite/react';

/** Illustrative data for the live hero figure. */
const signups = [
  { x: 'Jan', y: 18 },
  { x: 'Feb', y: 22 },
  { x: 'Mar', y: 21 },
  { x: 'Apr', y: 29 },
  { x: 'May', y: 34 },
  { x: 'Jun', y: 31 },
  { x: 'Jul', y: 42 },
  { x: 'Aug', y: 47 },
  { x: 'Sep', y: 63 },
  { x: 'Oct', y: 68 },
  { x: 'Nov', y: 74 },
  { x: 'Dec', y: 86 },
];

const SPECS = [
  { value: 15, suffix: 'KB', label: 'gzipped core, budget enforced in CI' },
  { value: 0, suffix: '', label: 'runtime dependencies' },
  { value: 8, suffix: '', label: 'chart types, one API' },
  { value: 4, suffix: '', label: 'data formats accepted as-is' },
  { value: 0, text: 'AA', suffix: '', label: 'WCAG 2.1, with keyboard & screen-reader support' },
];

export default function Hero() {
  const scope = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-rule', { scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'power2.inOut' });
      tl.from('.hero-mast', { y: 8, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.2);
      tl.from('.hero-word', { yPercent: 110, duration: 1, stagger: 0.07 }, 0.25);
      tl.from('.hero-swash', { strokeDashoffset: 1, duration: 1.1, ease: 'power2.inOut' }, 0.9);
      tl.from('.hero-sub', { y: 16, opacity: 0, duration: 0.7 }, 0.7);
      tl.from('.hero-cta', { y: 12, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.8);
      tl.from('.hero-fig', { y: 30, opacity: 0, duration: 1.1 }, 0.35);
      tl.from('.hero-spec', { y: 12, opacity: 0, duration: 0.5, stagger: 0.07 }, 1);

      document.querySelectorAll<HTMLElement>('.hero-count').forEach((el) => {
        const to = Number(el.dataset.to);
        const obj = { v: 0 };
        el.textContent = obj.v.toFixed(0);
        gsap.to(obj, {
          v: to,
          duration: 1.4,
          delay: 1,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = obj.v.toFixed(0);
          },
        });
      });
    },
    { scope }
  );

  const copy = () => {
    navigator.clipboard?.writeText('npm i @chartlite/core');
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section ref={scope} className="relative mx-auto max-w-6xl px-6 pt-28 pb-6 md:pt-32">
      {/* Masthead */}
      <div className="hero-rule h-px bg-ink" />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        <span className="hero-mast">No. 1.1</span>
        <span className="hero-mast hidden sm:inline">An almanac of small, honest charts</span>
        <span className="hero-mast">MIT · Zero dependencies</span>
      </div>
      <div className="hero-rule h-px bg-rule" />

      <div className="mt-12 grid items-end gap-14 lg:mt-16 lg:grid-cols-[1.15fr_1fr]">
        {/* Copy */}
        <div>
          <h1 className="font-serif text-[3.6rem] leading-[0.95] tracking-[-0.02em] text-ink sm:text-[5rem] lg:text-[6.2rem]">
            <span className="block overflow-hidden pb-1">
              <span className="hero-word inline-block">Beautiful</span>{' '}
              <span className="hero-word inline-block">charts,</span>
            </span>
            <span className="relative block overflow-hidden pb-4">
              <span className="hero-word inline-block italic text-accent">honestly</span>{' '}
              <span className="hero-word inline-block italic text-accent">tiny.</span>
              <svg
                aria-hidden
                viewBox="0 0 440 24"
                preserveAspectRatio="none"
                className="absolute bottom-0 left-0 h-4 w-[min(100%,29rem)] overflow-visible"
              >
                <path
                  className="hero-swash stroke-accent"
                  d="M4 16 C 70 6, 150 4, 230 11 S 380 20, 436 8"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset="0"
                />
              </svg>
            </span>
          </h1>

          <p className="hero-sub mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
            A zero-dependency SVG charting library for landing pages, docs, and
            dashboards that should load instantly. Accessible by default,
            server-renderable, and at home in React, Vue, Svelte, or plain HTML.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={copy}
              className="hero-cta code-plate group flex items-center gap-3 rounded-lg px-4 py-3 font-mono text-sm transition-transform hover:-translate-y-0.5"
            >
              <span className="text-accent">$</span>
              npm i @chartlite/core
              <span className="text-slate-muted transition-colors group-hover:text-slate-text">
                {copied ? '✓ copied' : 'copy'}
              </span>
            </button>
            <a
              href="#gallery"
              className="hero-cta group text-sm font-medium text-ink underline decoration-rule decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent"
            >
              Browse the plates{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        {/* Fig. 1 — a live Chartlite chart */}
        <figure className="hero-fig">
          <div className="plate crop-marks rounded-sm p-5">
            <div className="mb-1 flex items-baseline justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Monthly signups (k)</p>
              <p className="font-mono text-xs text-teal">▲ 4.8× YoY</p>
            </div>
            <AreaChart
              data={signups}
              curve="smooth"
              cssVars
              height={290}
              referenceLines={[{ axis: 'y', value: 60, label: 'Target', style: 'dashed' }]}
              annotations={[{ x: 'Sep', y: 63, text: 'v1.0 launch', anchor: 'top-left', offset: { x: -8, y: -6 }, showArrow: true }]}
            />
          </div>
          <figcaption className="mt-4 flex gap-3 text-sm text-muted">
            <span className="shrink-0 whitespace-nowrap pt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink">Fig. 1</span>
            <span className="font-serif text-base italic leading-snug">
              Drawn live by Chartlite: a smooth area, a reference line, and an
              annotation, themed with CSS variables. Illustrative data.
            </span>
          </figcaption>
        </figure>
      </div>

      {/* Spec sheet */}
      <dl className="mt-20 grid grid-cols-2 border-t border-ink sm:grid-cols-3 lg:grid-cols-5">
        {SPECS.map((s) => (
          <div key={s.label} className="hero-spec border-b border-rule py-5 pr-5 lg:border-b-0 lg:border-r lg:pl-5 lg:first:pl-0 lg:last:border-r-0">
            <dd className="font-serif text-5xl leading-none text-ink">
              {s.text ?? (
                <span className="hero-count" data-to={s.value}>
                  {s.value}
                </span>
              )}
              <span className="text-3xl text-accent">{s.suffix}</span>
            </dd>
            <dt className="mt-2 text-sm leading-snug text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
