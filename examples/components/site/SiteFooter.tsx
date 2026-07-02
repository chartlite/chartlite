import Link from 'next/link';

const cols: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Charts', href: '/#gallery' },
      { label: 'Frameworks', href: '/#frameworks' },
      { label: 'Theming', href: '/#theming' },
      { label: 'Agents', href: '/#agents' },
    ],
  },
  {
    title: 'Examples',
    links: [
      { label: 'Basics', href: '/basic-examples' },
      { label: 'Gallery', href: '/chart-gallery' },
      { label: 'Multi-series', href: '/multi-series' },
      { label: 'Performance', href: '/performance' },
    ],
  },
  {
    title: 'Packages',
    links: [
      { label: '@chartlite/core', href: 'https://www.npmjs.com/package/@chartlite/core', external: true },
      { label: '@chartlite/react', href: 'https://www.npmjs.com/package/@chartlite/react', external: true },
      { label: '@chartlite/vue', href: 'https://www.npmjs.com/package/@chartlite/vue', external: true },
      { label: '@chartlite/svelte', href: 'https://www.npmjs.com/package/@chartlite/svelte', external: true },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-32">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-800 border border-white/10 text-glow-cyan">
              ◔
            </span>
            <span className="font-display text-lg font-semibold text-mist-100">Chartlite</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-mist-500">
            Beautiful charts for modern web apps. Lightweight, fast, accessible,
            and agent-native.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-mist-600">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) =>
                l.external ? (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-mist-500 transition-colors hover:text-mist-100"
                    >
                      {l.label}
                    </a>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-mist-500 transition-colors hover:text-mist-100"
                    >
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/5 px-6 py-6 text-sm text-mist-600 sm:flex-row">
        <p>MIT © {new Date().getFullYear()} Riel St. Amand</p>
        <p className="font-mono text-xs">Built with Chartlite · zero dependencies</p>
      </div>
    </footer>
  );
}
