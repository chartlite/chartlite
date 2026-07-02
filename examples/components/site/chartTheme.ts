import type { CSSProperties } from 'react';

/**
 * "Neon on dark" theme expressed purely as Chartlite CSS custom properties.
 * Applied to a wrapper element; every chart rendered with `cssVars` inside picks
 * these up — so the marketing site themes the library the same way a user would
 * (dogfooding `cssVars`).
 */
export const neonOnDark = {
  '--cl-bg': 'transparent',
  '--cl-text': '#8b8ba7',
  '--cl-grid': 'rgba(255,255,255,0.07)',
  '--cl-primary': '#22d3ee',
  '--cl-series-0': '#22d3ee',
  '--cl-series-1': '#a855f7',
  '--cl-series-2': '#6366f1',
  '--cl-series-3': '#ec4899',
  '--cl-series-4': '#34d399',
} as CSSProperties;
