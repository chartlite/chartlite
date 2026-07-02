'use client';

import { useState } from 'react';

/**
 * Flips the global `data-chart-theme` on <html>, which swaps the `--cl-*` tokens
 * in globals.css — re-theming every `cssVars` chart at once, no redraw. The
 * initial attribute is set pre-hydration by a small inline script in the root
 * layout (so returning light-mode visitors don't flash), and this button reads
 * that as its initial state. Persisted to localStorage.
 */
function initialLight(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.chartTheme === 'light';
}

export default function ChartThemeToggle() {
  const [light, setLight] = useState<boolean>(initialLight);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.chartTheme = next ? 'light' : 'dark';
    try {
      localStorage.setItem('cl-chart-theme', next ? 'light' : 'dark');
    } catch {
      /* ignore storage failures */
    }
  };

  return (
    <button
      onClick={toggle}
      title="Toggle chart theme (light/dark)"
      aria-label="Toggle chart theme"
      suppressHydrationWarning
      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-sm text-mist-500 transition-colors hover:border-white/25 hover:text-mist-100"
    >
      {light ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      <span className="hidden sm:inline">Charts</span>
    </button>
  );
}
