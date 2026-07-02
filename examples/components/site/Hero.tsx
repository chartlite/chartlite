'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

/** A pleasing upward-trending series in viewBox (600×360) coordinates. */
const POINTS = [
  { x: 30, y: 300 },
  { x: 82, y: 280 },
  { x: 134, y: 292 },
  { x: 186, y: 240 },
  { x: 238, y: 258 },
  { x: 290, y: 196 },
  { x: 342, y: 214 },
  { x: 394, y: 150 },
  { x: 446, y: 168 },
  { x: 498, y: 96 },
  { x: 550, y: 70 },
  { x: 570, y: 58 },
];

/** Catmull-Rom → cubic bezier smoothing. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.2;
    d += ` C ${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${
      p2.x - (p3.x - p1.x) * t
    },${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
  }
  return d;
}

const line = smoothPath(POINTS);
const area = `${line} L ${POINTS[POINTS.length - 1].x},340 L ${POINTS[0].x},340 Z`;

export default function Hero() {
  const scope = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Headline words rise in.
      tl.from('.hero-word', { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.08 });
      tl.from('.hero-sub', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5');
      tl.from('.hero-cta', { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4');
      tl.from('.hero-stat', { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.3');

      // Chart card floats in.
      tl.from('.hero-card', { y: 40, opacity: 0, scale: 0.96, duration: 1 }, 0.2);

      // Line draws itself.
      const path = lineRef.current;
      if (path && !reduce) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.set('.hero-area', { opacity: 0 });
        gsap.set('.hero-dot', { scale: 0, transformOrigin: 'center' });
        gsap.set('.hero-pulse', { scale: 0, transformOrigin: 'center' });
        const draw = gsap.timeline({ delay: 0.7 });
        draw.to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' });
        draw.to('.hero-area', { opacity: 1, duration: 0.8 }, 0.5);
        draw.to('.hero-dot', { scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(2)' }, 0.8);
        draw.to('.hero-pulse', { scale: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.2');
      }

      // Animated counters.
      document.querySelectorAll<HTMLElement>('.hero-count').forEach((el) => {
        const to = Number(el.dataset.to);
        const dec = Number(el.dataset.dec ?? 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: to,
          duration: 1.6,
          delay: 0.6,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = obj.v.toFixed(dec)),
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
    <section ref={scope} className="relative mx-auto max-w-6xl px-6 pt-40 pb-24 md:pt-48">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        {/* Copy */}
        <div>
          <div className="hero-cta mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/60 px-3.5 py-1.5 text-xs text-mist-300">
            <span className="h-1.5 w-1.5 rounded-full bg-glow-cyan shadow-[0_0_8px_2px] shadow-glow-cyan/60" />
            v0.12 · 9 chart types · SSR + agent-native
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-mist-100 sm:text-6xl md:text-7xl">
            <span className="block overflow-hidden">
              <span className="hero-word inline-block">Beautiful</span>{' '}
              <span className="hero-word inline-block">charts,</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="hero-word inline-block text-gradient">honestly</span>{' '}
              <span className="hero-word inline-block text-gradient">tiny.</span>
            </span>
          </h1>

          <p className="hero-sub mt-6 max-w-lg text-lg text-mist-500">
            A zero-dependency SVG charting library. ~13KB gzipped, fast by default,
            WCAG&nbsp;AA, server-renderable — with React, Vue, Svelte, and a
            <span className="text-mist-300"> &lt;chart-lite&gt;</span> web component.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={copy}
              className="hero-cta group flex items-center gap-3 rounded-xl border border-white/10 bg-ink-800/70 px-4 py-3 font-mono text-sm text-mist-200 transition-colors hover:border-white/20"
            >
              <span className="text-glow-cyan">$</span>
              npm i @chartlite/core
              <span className="text-mist-500 transition-colors group-hover:text-mist-100">
                {copied ? '✓ copied' : '⧉'}
              </span>
            </button>
            <a
              href="#gallery"
              className="hero-cta rounded-xl bg-mist-100 px-5 py-3 text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
            >
              See the charts →
            </a>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-4 gap-4">
            {[
              { to: 13, dec: 0, suffix: 'KB', label: 'gzipped' },
              { to: 0, dec: 0, suffix: '', label: 'deps' },
              { to: 9, dec: 0, suffix: '', label: 'chart types' },
              { to: 100, dec: 0, suffix: '%', label: 'WCAG AA' },
            ].map((s) => (
              <div key={s.label} className="hero-stat">
                <dd className="font-display text-2xl font-semibold text-mist-100">
                  <span className="hero-count" data-to={s.to} data-dec={s.dec}>
                    0
                  </span>
                  {s.suffix}
                </dd>
                <dt className="mt-1 text-xs text-mist-600">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Chart card */}
        <div className="hero-card border-glow glow-shadow relative rounded-3xl glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-mist-600">Revenue</p>
              <p className="font-display text-2xl font-semibold text-mist-100">
                $<span className="hero-count" data-to={72.4} data-dec={1}>0</span>k
              </p>
            </div>
            <span className="rounded-full bg-glow-cyan/10 px-2.5 py-1 text-xs font-semibold text-glow-cyan">
              ▲ 34%
            </span>
          </div>

          <svg viewBox="0 0 600 360" className="w-full" role="img" aria-label="Animated revenue line chart">
            <defs>
              <linearGradient id="hero-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hero-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* gridlines */}
            {[70, 140, 210, 280].map((y) => (
              <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="#ffffff" strokeOpacity="0.05" />
            ))}

            <path className="hero-area" d={area} fill="url(#hero-area-grad)" />
            <path
              ref={lineRef}
              d={line}
              fill="none"
              stroke="url(#hero-line-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {POINTS.filter((_, i) => i % 2 === 0).map((p, i) => (
              <circle key={i} className="hero-dot" cx={p.x} cy={p.y} r="4" fill="#0a0a12" stroke="#22d3ee" strokeWidth="2.5" />
            ))}

            {/* live pulse at the end */}
            <g className="hero-pulse">
              <circle cx={POINTS[POINTS.length - 1].x} cy={POINTS[POINTS.length - 1].y} r="6" fill="#a855f7" />
              <circle cx={POINTS[POINTS.length - 1].x} cy={POINTS[POINTS.length - 1].y} r="6" fill="none" stroke="#a855f7" strokeWidth="2">
                <animate attributeName="r" from="6" to="16" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>

          <div className="mt-3 flex justify-between font-mono text-[11px] text-mist-600">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
          </div>
        </div>
      </div>
    </section>
  );
}
