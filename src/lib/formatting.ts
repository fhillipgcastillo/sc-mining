/**
 * Number and string formatting utilities for the Star Citizen Mining Data app.
 *
 * All functions are pure and work in both Server Components and Client
 * Components — no browser APIs required.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Clamps a value to [0, Infinity] and guards against NaN / undefined so
 * display functions never render "NaN%" or throw.
 */
function safeNumber(value: number | undefined | null, fallback = 0): number {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return fallback;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Public formatters
// ---------------------------------------------------------------------------

/**
 * Formats a decimal fraction (0–1) as a percentage with one decimal place.
 *
 * @example
 * formatPercent(0.452)   // "45.2%"
 * formatPercent(1)       // "100.0%"
 * formatPercent(0)       // "0.0%"
 */
export function formatPercent(value: number): string {
  return `${(safeNumber(value) * 100).toFixed(1)}%`;
}

/**
 * Formats a whole or decimal number with comma thousand-separators.
 * Fractional parts are preserved but limited to avoid runaway decimals.
 *
 * @example
 * formatNumber(1234)      // "1,234"
 * formatNumber(1234567)   // "1,234,567"
 * formatNumber(92856.5)   // "92,856.5"
 */
export function formatNumber(value: number): string {
  const n = safeNumber(value);
  // toLocaleString is safe here — we're not rendering inside a deterministic
  // SSR comparison context, and the locale is always 'en-US'.
  return n.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a decimal fraction (0–1) as a probability percentage with one
 * decimal place. Semantically identical to `formatPercent` but named
 * explicitly for probability fields to aid readability at call sites.
 *
 * @example
 * formatProbability(0.875)  // "87.5%"
 * formatProbability(0.2036) // "20.4%"
 */
export function formatProbability(value: number): string {
  return `${(safeNumber(value) * 100).toFixed(1)}%`;
}

/**
 * Formats a stat-range value (mass, instability, resistance) for display.
 * Uses `formatNumber` and appends an optional unit string.
 *
 * @example
 * formatStat(7985)         // "7,985"
 * formatStat(37.78, "SCU") // "37.78 SCU"
 */
export function formatStat(value: number, unit?: string): string {
  const formatted = formatNumber(safeNumber(value));
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Returns a compact label for a stat range: "min – max (med median)".
 *
 * @example
 * formatStatRange({ min: 0, max: 92856, med: 7985 })
 * // "0 – 92,856 (med 7,985)"
 */
export function formatStatRange(
  range: { min: number; max: number; med: number },
  unit?: string,
): string {
  const min = formatStat(range.min, unit);
  const max = formatStat(range.max, unit);
  const med = formatStat(range.med, unit);
  return `${min} – ${max} (med ${med})`;
}
