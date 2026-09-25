'use client';

/**
 * Flips `data-theme` on <html> between paper and night. Every site colour and
 * every `cssVars` chart reads CSS custom properties, so the whole page — charts
 * included — re-themes without a redraw. The initial attribute is set
 * pre-hydration by a small inline script in the root layout. The icon and label
 * switch through the `night:` CSS variant rather than React state, so server and
 * client markup match and hydration never re-renders (and resets) <html>.
 */
export default function ChartThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try {
      localStorage.setItem('cl-theme', next ? 'dark' : 'light');
    } catch {
      /* ignore storage failures */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark theme"
      className="flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 text-sm text-muted transition-colors hover:border-ink hover:text-ink"
    >
      <svg className="night:hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="hidden night:block" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <span className="hidden sm:inline night:sm:hidden">Paper</span>
      <span className="hidden night:sm:inline">Night</span>
    </button>
  );
}
