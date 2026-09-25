import Link from 'next/link';
import Logo from './Logo';
import { NAV_LINKS } from './navLinks';

const exampleLinks = [
  { label: 'Chart types', href: '/examples#types' },
  { label: 'Data formats', href: '/examples#data' },
  { label: 'Multi-series', href: '/examples#multi' },
  { label: 'Performance', href: '/examples#performance' },
];

const packageLinks = [
  { label: '@chartlite/core', href: 'https://www.npmjs.com/package/@chartlite/core' },
  { label: '@chartlite/react', href: 'https://www.npmjs.com/package/@chartlite/react' },
  { label: '@chartlite/vue', href: 'https://www.npmjs.com/package/@chartlite/vue' },
  { label: '@chartlite/svelte', href: 'https://www.npmjs.com/package/@chartlite/svelte' },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{title}</h4>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

const linkClass = 'text-sm text-ink-soft transition-colors hover:text-accent-ink';

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mt-16 bg-paper-sunken">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 border-t border-ink py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo className="h-6 w-6" />
              <span className="font-serif text-2xl leading-none text-ink">Chartlite</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Beautiful charts for modern web apps. Lightweight, fast, accessible,
              and agent-native.
            </p>
          </div>

          <Column title="Product">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>

          <Column title="Examples">
            {exampleLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>

          <Column title="Packages">
            {packageLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer" className={`${linkClass} font-mono text-[13px]`}>
                  {l.label}
                </a>
              </li>
            ))}
          </Column>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-rule py-6 text-sm text-muted sm:flex-row">
          <p>MIT © {new Date().getFullYear()} Riel St. Amand</p>
          <p className="font-serif italic">
            Colophon: set in Instrument Serif, Geist &amp; Geist Mono. Every chart drawn by Chartlite.
          </p>
        </div>
      </div>
    </footer>
  );
}
