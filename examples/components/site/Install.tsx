import Reveal from './Reveal';

export default function Install() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="border-glow glow-shadow relative overflow-hidden rounded-3xl glass px-8 py-16 text-center">
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_circle_at_50%_-10%,rgba(34,211,238,0.12),transparent_60%)]" />
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-glow-cyan">
            Ready in one line
          </p>
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold tracking-tight text-mist-100 sm:text-5xl">
            Beautiful charts, shipping today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-mist-500">
            Zero dependencies. ~13KB gzipped. MIT licensed. Pick your framework and
            go.
          </p>

          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-xl border border-white/10 bg-ink-900/70 px-5 py-4 font-mono text-sm text-mist-100">
            <span className="text-glow-cyan">$</span> npm i @chartlite/core
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.npmjs.com/package/@chartlite/core"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-mist-100 px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
            >
              View on npm
            </a>
            <a
              href="https://github.com/chartlite/chartlite"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-mist-100 transition-colors hover:border-white/30"
            >
              Star on GitHub
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-mist-600">
            {['@chartlite/core', '@chartlite/react', '@chartlite/vue', '@chartlite/svelte', '@chartlite/element', '@chartlite/mcp'].map(
              (p) => (
                <span key={p}>{p}</span>
              )
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
