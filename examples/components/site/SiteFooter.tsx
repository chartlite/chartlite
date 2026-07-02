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

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="font-display text-lg font-semibold text-mist-100">Chartlite</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-mist-500">
            Beautiful charts for modern web apps. Lightweight, fast, accessible,
            and agent-native.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-mist-600">Product</h4>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-mist-500 transition-colors hover:text-mist-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-mist-600">Examples</h4>
          <ul className="mt-4 space-y-2.5">
            {exampleLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-mist-500 transition-colors hover:text-mist-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-mist-600">Packages</h4>
          <ul className="mt-4 space-y-2.5">
            {packageLinks.map((l) => (
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
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/5 px-6 py-6 text-sm text-mist-600 sm:flex-row">
        <p>MIT © {new Date().getFullYear()} Riel St. Amand</p>
        <p className="font-mono text-xs">Built with Chartlite · zero dependencies</p>
      </div>
    </footer>
  );
}
