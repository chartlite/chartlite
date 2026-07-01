/**
 * WCAG 2.1 Color Contrast Checker
 *
 * Calculates contrast ratios according to WCAG 2.1 guidelines:
 * - Normal text (< 18pt): Minimum 4.5:1 (AA) or 7:1 (AAA)
 * - Large text (>= 18pt or bold >= 14pt): Minimum 3:1 (AA) or 4.5:1 (AAA)
 * - UI components: Minimum 3:1 (AA)
 *
 * Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 *
 * @param color1 - First color (hex format: #RRGGBB)
 * @param color2 - Second color (hex format: #RRGGBB)
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color format');
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio passes WCAG AA
 */
export function passesWCAG_AA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

/**
 * Check if contrast ratio passes WCAG AAA
 */
export function passesWCAG_AAA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 4.5 : ratio >= 7.0;
}

/**
 * Get WCAG rating for a contrast ratio
 */
export function getWCAGRating(
  ratio: number,
  isLargeText: boolean = false
): 'AAA' | 'AA' | 'Fail' {
  if (passesWCAG_AAA(ratio, isLargeText)) return 'AAA';
  if (passesWCAG_AA(ratio, isLargeText)) return 'AA';
  return 'Fail';
}

/**
 * Audit a color against a background
 */
export interface ContrastAuditResult {
  color: string;
  background: string;
  ratio: number;
  normalText: 'AAA' | 'AA' | 'Fail';
  largeText: 'AAA' | 'AA' | 'Fail';
  uiComponent: 'Pass' | 'Fail';
}

export function auditContrast(color: string, background: string): ContrastAuditResult {
  const ratio = getContrastRatio(color, background);

  return {
    color,
    background,
    ratio,
    normalText: getWCAGRating(ratio, false),
    largeText: getWCAGRating(ratio, true),
    uiComponent: ratio >= 3.0 ? 'Pass' : 'Fail',
  };
}

/**
 * Format contrast ratio for display
 */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
