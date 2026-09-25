import { renderToString, type ChartSpec } from '@chartlite/core/server';
import Reveal from './Reveal';

/**
 * The SSR flourish: this exact spec is rendered to an SVG string on the server
 * (Node, at request/build time) via `renderToString` — the markup ships in the
 * HTML with zero client JavaScript. `cssVars: true` makes it theme from the
 * site's `--cl-*` tokens, so it also follows the Paper/Night toggle without a
 * redraw. View source on this page and the `<svg>` is right there.
 */
const series = [
  { name: 'Signups', dataKey: 'signups', type: 'bar' as const },
  { name: 'Active', dataKey: 'active', type: 'line' as const },
];
const rows = [
  { x: 'Jan', signups: 120, active: 80 },
  { x: 'Feb', signups: 180, active: 110 },
  { x: 'Mar', signups: 160, active: 140 },
  { x: 'Apr', signups: 240, active: 190 },
  { x: 'May', signups: 300, active: 230 },
  { x: 'Jun', signups: 280, active: 280 },
];

const spec: ChartSpec = {
  type: 'combo',
  cssVars: true,
  width: 640,
  height: 340,
  title: 'Monthly growth',
  data: { series, data: rows },
};

// Runs on the server. No 'use client' — this string is baked into the response.
const svg = renderToString(spec);

/** `{ a: 'x', b: 1 }` on one line, so each series and row reads as a single record. */
function literal(record: Record<string, string | number>): string {
  const fields = Object.entries(record).map(([key, value]) => `${key}: ${JSON.stringify(value).replaceAll('"', "'")}`);
  return `{ ${fields.join(', ')} }`;
}

const code = `import { renderToString } from '@chartlite/core/server';

const svg = renderToString({
  type: 'combo',
  cssVars: true,
  width: 640,
  height: 340,
  title: 'Monthly growth',
  data: {
    series: [
${series.map((s) => `      ${literal(s)},`).join('\n')}
    ],
    data: [
${rows.map((r) => `      ${literal(r)},`).join('\n')}
    ],
  },
});`;

export default function SSRProof() {
  return (
    <Reveal className="mb-16 grid overflow-hidden rounded-sm lg:grid-cols-[1.1fr_1fr]">
      {/* The genuinely server-rendered chart. */}
      <figure className="plate flex flex-col justify-center p-6 lg:border-r-0">
        <div className="[&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        <figcaption className="mt-4 flex gap-3 text-sm text-muted">
          <span className="shrink-0 whitespace-nowrap pt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink">Fig. 4</span>
          <span className="font-serif text-[15px] italic">
            Rendered on the server. This SVG is in the page source, and no client JavaScript drew it.
          </span>
        </figcaption>
      </figure>

      {/* The exact spec that produced it. */}
      <div className="code-plate flex flex-col p-6">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">The spec</p>
        <pre className="flex-1 overflow-x-auto font-mono text-[11.5px] leading-relaxed text-slate-text/85">
          <code>{code}</code>
        </pre>
      </div>
    </Reveal>
  );
}
