/**
 * Pure field validators.
 *
 * Each returns `null` when the value is acceptable, or `{ key, params }` naming
 * a translation entry. Validators know nothing about React or the message
 * catalogue, so they are testable on their own and the same rule cannot drift
 * between the three forms that use it — the pre-1.0 code re-implemented this
 * logic in `Fuel`, `Car`, `CombustionReport` and `RouteReport`, and the copies
 * had already diverged.
 */

export const MIN_NAME_LENGTH = 3;

/**
 * @param {string} value
 * @param {object} [options]
 * @param {number} [options.min=3] minimum length
 * @param {(name: string) => boolean} [options.isDuplicate] existing-name check
 */
export function validateName(value, options = {}) {
  const { min = MIN_NAME_LENGTH, isDuplicate } = options;
  const trimmed = (value ?? '').trim();

  if (trimmed.length === 0) return { key: 'validation.required' };
  if (trimmed.length < min) return { key: 'validation.tooShort', params: { min } };
  if (typeof isDuplicate === 'function' && isDuplicate(trimmed)) return { key: 'validation.duplicate' };
  return null;
}

/**
 * @param {string|number} value
 * @param {object} [options]
 * @param {boolean} [options.positive=false] reject zero and negatives
 * @param {boolean} [options.required=true]
 */
export function validateNumber(value, options = {}) {
  const { positive = false, required = true } = options;
  const raw = typeof value === 'string' ? value.trim() : value;

  if (raw === '' || raw === null || raw === undefined) {
    return required ? { key: 'validation.required' } : null;
  }

  // `Number()` rather than `parseFloat`: parseFloat('12abc') is 12, which let
  // the original app store garbage as a valid measurement.
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return { key: 'validation.numbersOnly' };
  if (positive && parsed <= 0) return { key: 'validation.positive' };
  return null;
}

/**
 * Run a `{ field: validator }` map over `{ field: value }`.
 * @returns {{errors: Record<string, {key: string, params?: object}>, valid: boolean}}
 */
export function validateAll(values, validators) {
  const errors = {};
  for (const [field, validator] of Object.entries(validators)) {
    const error = validator(values[field]);
    if (error) errors[field] = error;
  }
  return { errors, valid: Object.keys(errors).length === 0 };
}
