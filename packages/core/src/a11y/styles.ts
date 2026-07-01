/**
 * Accessibility CSS injected once per document.
 *
 * Covers the screen-reader-only data table, chart/data-point focus indicators,
 * and Windows High Contrast Mode support.
 */

export const ACCESSIBILITY_CSS = `
      /* Chartlite Accessibility Styles */

      /* Screen reader only content */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      /* Chart focus indicator */
      svg[role="img"]:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 4px;
      }

      /* Remove default outline for mouse users */
      svg[role="img"]:focus:not(:focus-visible) {
        outline: none;
      }

      /* Data point focus indicator */
      .data-point-focused {
        stroke: #2563eb !important;
        stroke-width: 3 !important;
        filter: drop-shadow(0 0 4px rgba(37, 99, 235, 0.5));
      }

      /* Increase size for focused circles */
      circle.data-point-focused {
        r: 6;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        svg[role="img"]:focus-visible {
          outline: 3px solid CanvasText;
          outline-offset: 4px;
        }

        .data-point-focused {
          stroke: Highlight !important;
          stroke-width: 4 !important;
        }
      }
    `;

const A11Y_STYLE_ID = 'chartlite-a11y-styles';

/** Inject the accessibility stylesheet once (idempotent per document). */
export function injectAccessibilityStyles(): void {
  if (document.getElementById(A11Y_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = A11Y_STYLE_ID;
  style.textContent = ACCESSIBILITY_CSS;
  document.head.appendChild(style);
}
