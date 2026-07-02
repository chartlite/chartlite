import { renderToString, type ChartSpec } from '@chartlite/core/server';
import Reveal from './Reveal';

/**
 * The SSR flourish: this exact spec is rendered to an SVG string on the server
 * (Node, at request/build time) via `renderToString` — the markup ships in the
 * HTML with zero client JavaScript. `cssVars: true` makes it theme from the
 * site's `--cl-*` tokens, so it also responds to the light/dark chart toggle
 * without a redraw. View source on this page and the `<svg>` is right there.
 */
const spec: ChartSpec = {
  type: 'combo',
  cssVars: true,
  width: 640,
  height: 340,
  title: 'Monthly growth',
  data: {
    series: [
      { name: 'Signups', dataKey: 'signups', type: 'bar' },
      { name: 'Active', dataKey: 'active', type: 'line' },
    ],
    data: [
      { x: 'Jan', signups: 120, active: 80 },
      { x: 'Feb', signups: 180, active: 110 },
      { x: 'Mar', signups: 160, active: 140 },
      { x: 'Apr', signups: 240, active: 190 },
      { x: 'May', signups: 300, active: 230 },
      { x: 'Jun', signups: 280, active: 280 },
    ],
  },
};

// Runs on the server. No 'use client' — this string is baked into the response.
const svg = renderToString(spec);

const code = `import { renderToString } from '@chartlite/core/server';

const svg = renderToString(${JSON.stringify(spec, null, 2)});`;

export default function SSRProof() {
  return (
    <Reveal className="border-glow glow-shadow relative mb-8 grid gap-0 overflow-hidden rounded-3xl glass lg:grid-cols-[1.1fr_1fr]">
      {/* The genuinely server-rendered chart. */}
      <div className="flex flex-col justify-center border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
        <div
          className="[&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-mist-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-glow-cyan shadow-[0_0_8px_2px] shadow-glow-cyan/50" />
          Rendered on the server — this SVG is in your page source. No client JS ran.
        </p>
      </div>

      {/* The exact spec that produced it. */}
      <div className="flex flex-col p-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-glow-cyan">
          The spec →
        </p>
        <pre className="flex-1 overflow-x-auto rounded-xl border border-white/10 bg-ink-900/60 p-4 font-mono text-[11px] leading-relaxed text-mist-400">
          <code>{code}</code>
        </pre>
      </div>
    </Reveal>
  );
}
