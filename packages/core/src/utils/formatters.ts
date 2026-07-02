/**
 * Built-in value formatters for axis tick labels.
 *
 * Each is a `(value: number) => string`, matching `BaseChartConfig.valueFormatter`.
 * They wrap `Intl` where possible so output is locale-aware. Consumers can also pass
 * their own function.
 */

export type ValueFormatter = (value: number) => string;

/** Abbreviate large numbers: 1500 → "1.5K", 2_300_000 → "2.3M". */
export function abbreviate(value: number, digits = 1): string {
  const abs = Math.abs(value);
  const units: Array<[number, string]> = [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ];
  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const scaled = value / threshold;
      // Trim trailing ".0" (e.g. 2.0K -> 2K)
      return `${parseFloat(scaled.toFixed(digits))}${suffix}`;
    }
  }
  return String(value);
}

/** Currency formatter factory. `currency('USD')(1234.5)` → "$1,234.50". */
export function currency(
  currencyCode = 'USD',
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {}
): ValueFormatter {
  const fmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    ...options,
  });
  return (value) => fmt.format(value);
}

/** Percent formatter. `percent()(0.25)` → "25%". Input is a ratio (0–1). */
export function percent(
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {}
): ValueFormatter {
  const fmt = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
    ...options,
  });
  return (value) => fmt.format(value);
}

/** Fixed-decimal number formatter with thousands separators. */
export function number(
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {}
): ValueFormatter {
  const fmt = new Intl.NumberFormat(locale, options);
  return (value) => fmt.format(value);
}

/**
 * Namespace object so consumers can write `formatters.abbreviate` /
 * `formatters.currency('EUR')` after a single import.
 */
export const formatters = {
  abbreviate: (value: number) => abbreviate(value),
  currency,
  percent,
  number,
};
