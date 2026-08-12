/**
 * Accessibility CSS injected once per document.
 *
 * Covers the screen-reader-only data table, chart/data-point focus indicators,
 * and Windows High Contrast Mode support.
 */

export const ACCESSIBILITY_CSS = '.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.bar{transition:opacity .2s}.bar:hover{opacity:.8}svg[role=img]:focus-visible{outline:2px solid #2563eb;outline-offset:4px}.data-point-focused{stroke:#2563eb!important;stroke-width:3!important;filter:drop-shadow(0 0 4px #2563eb80)}@media(prefers-contrast:high){svg[role=img]:focus-visible{outline:3px solid CanvasText}.data-point-focused{stroke:Highlight!important;stroke-width:4!important}}';

const A11Y_STYLE_ID = 'chartlite-a11y-styles';

/** Inject the accessibility stylesheet once (idempotent per document). */
export function injectAccessibilityStyles(): void {
  if (document.getElementById(A11Y_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = A11Y_STYLE_ID;
  style.textContent = ACCESSIBILITY_CSS;
  document.head.appendChild(style);
}
