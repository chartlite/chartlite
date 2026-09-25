import Reveal from './Reveal';
import SectionHeader from './SectionHeader';
import SSRProof from './SSRProof';

const entries = [
  {
    term: 'SSR',
    title: 'Render on the server',
    body: 'renderToString(spec) turns a chart spec into an SVG string in Node, Bun, or at the edge, with no browser and no jsdom. Charts ship with zero client JavaScript.',
    code: `import { renderToString } from '@chartlite/core/server';

const svg = renderToString({ type: 'line', data });`,
  },
  {
    term: 'MCP',
    title: 'Agents render charts',
    body: 'The @chartlite/mcp server exposes render_chart and list_chart_types over the Model Context Protocol, so assistants can turn data into charts directly.',
    code: `{ "tool": "render_chart",
  "spec": { "type": "bar", "data": [1,2,3] } }`,
  },
  {
    term: 'Schema',
    title: 'Built for LLMs',
    body: 'Every chart spec has a published JSON Schema, alongside llms.txt and AGENTS.md, so tools and agents can discover and drive the whole API.',
    code: `chartlite.dev/llms.txt
@chartlite/core/schema.json`,
  },
];

export default function Agents() {
  return (
    <section id="agents" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-16 md:py-20">
      <SectionHeader number="§4" kicker="Agent-native" title="A charting library your tools understand.">
        Declarative specs, server rendering, an MCP server, and machine-readable
        schemas mean humans and agents build the same charts in the same way.
      </SectionHeader>

      <SSRProof />

      <Reveal stagger className="grid border-t border-ink md:grid-cols-3">
        {entries.map((e, i) => (
          <div key={e.term} className="flex flex-col border-b border-rule py-7 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
            <p className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
              <span className="kicker">{e.term}</span>
            </p>
            <h3 className="mt-3 font-serif text-3xl leading-tight text-ink">{e.title}</h3>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-soft">{e.body}</p>
            <pre className="code-plate mt-6 overflow-x-auto rounded-sm p-4 font-mono text-[11.5px] leading-relaxed">
              <code>{e.code}</code>
            </pre>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
