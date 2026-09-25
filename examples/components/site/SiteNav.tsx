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
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? 'border-rule bg-paper/85 backdrop-blur-md' : 'border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-6 w-6" />
          <span className="font-serif text-2xl leading-none tracking-tight text-ink">Chartlite</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-ink"
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
            className="hidden px-2 text-sm text-muted transition-colors hover:text-ink lg:block"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@chartlite/core"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
          >
            npm
          </a>
        </div>
      </nav>
    </header>
  );
}
