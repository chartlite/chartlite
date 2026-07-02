'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import ChartThemeToggle from './ChartThemeToggle';
import { NAV_LINKS } from './navLinks';

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 ${
          scrolled ? 'glass border-glow glow-shadow' : 'border border-transparent'
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="font-display text-lg font-semibold tracking-tight text-mist-100">
            Chartlite
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-mist-500 transition-colors hover:text-mist-100"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ChartThemeToggle />
          <a
            href="https://github.com/chartlite/chartlite"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-mist-500 transition-colors hover:text-mist-100 lg:block"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@chartlite/core"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-mist-100 px-3.5 py-1.5 text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
          >
            npm
          </a>
        </div>
      </nav>
    </header>
  );
}
