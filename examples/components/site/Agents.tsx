import Reveal from './Reveal';
import SSRProof from './SSRProof';

const cards = [
  {
    accent: 'text-glow-cyan',
    kicker: 'SSR',
    title: 'Render on the server',
    body: 'renderToString(spec) turns a chart spec into an SVG string in Node, Bun, or the edge — no browser, no jsdom. Ship charts with zero client JavaScript.',
    code: `import { renderToString } from '@chartlite/core/server';

const svg = renderToString({ type: 'line', data });`,
  },
  {
    accent: 'text-glow-violet',
    kicker: 'MCP',
    title: 'Agents render charts',
    body: 'The @chartlite/mcp server exposes render_chart and list_chart_types over the Model Context Protocol, so assistants can turn data into charts directly.',
    code: `{ "tool": "render_chart",
  "spec": { "type": "bar", "data": [1,2,3] } }`,
  },
  {
    accent: 'text-glow-pink',
    kicker: 'Machine-readable',
    title: 'Built for LLMs',
    body: 'A published JSON Schema for every chart spec, plus llms.txt and AGENTS.md, so tools and agents can discover and drive the whole API with confidence.',
    code: `chartlite.dev/llms.txt
@chartlite/core/schema.json`,
  },
];

export default function Agents() {
  return (
    <section id="agents" className="relative mx-auto max-w-6xl px-6 py-24 scroll-mt-24">
      <Reveal className="mb-14 max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-glow-cyan">
          Agent-native
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-mist-100 sm:text-5xl">
          A charting library your tools understand.
        </h2>
        <p className="mt-4 text-lg text-mist-500">
          Declarative specs, server rendering, an MCP server, and machine-readable
          schemas — so humans and agents build the same charts the same way.
        </p>
      </Reveal>

      <SSRProof />

      <Reveal stagger className="grid gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.kicker} className="border-glow flex flex-col rounded-2xl glass p-6">
            <p className={`mb-3 font-mono text-xs uppercase tracking-widest ${c.accent}`}>
              {c.kicker}
            </p>
            <h3 className="font-display text-xl font-semibold text-mist-100">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-500">{c.body}</p>
            <pre className="mt-5 overflow-x-auto rounded-lg border border-white/10 bg-ink-900/60 p-3 font-mono text-[11px] leading-relaxed text-mist-400">
              <code>{c.code}</code>
            </pre>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
