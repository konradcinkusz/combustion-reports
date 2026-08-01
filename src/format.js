/**
 * Locale-aware number formatting.
 *
 * `Intl` is used directly rather than `toFixed` so Polish readers get the comma
 * decimal separator they expect. Non-finite values render as an em dash instead
 * of the literal "NaN" the pre-1.0 UI displayed whenever a car had no reports.
 */
export function formatNumber(value, locale = 'en', { digits = 1 } = {}) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatInteger(value, locale = 'en') {
  return formatNumber(value, locale, { digits: 0 });
}
