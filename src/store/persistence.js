/**
 * localStorage persistence for the Redux store.
 *
 * The pre-1.0 app initialised Firebase but never read from or wrote to it, so
 * every car, fuel and report was lost on refresh. Persisting locally keeps the
 * app a zero-config static site: no account, no keys in the bundle, no backend
 * to run before it is useful.
 */

const STORAGE_KEY = 'combustion-reports/state';

/**
 * Bumped when the persisted shape changes in a way older snapshots cannot
 * satisfy. A mismatch discards the snapshot rather than feeding a
 * wrong-shaped object into the reducers.
 */
const SCHEMA_VERSION = 1;

/** localStorage is absent in SSR and blocked outright in some privacy modes. */
function storage() {
  try {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return globalThis.localStorage;
  } catch {
    // Accessing the property itself throws when cookies are fully blocked.
    return null;
  }
}

export function loadState() {
  const store = storage();
  if (!store) return undefined;

  let raw;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return undefined;
  }
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SCHEMA_VERSION) return undefined;
    return validate(parsed.state);
  } catch {
    // Corrupt or hand-edited entry: fall back to defaults instead of crashing
    // the whole app at startup.
    return undefined;
  }
}

export function saveState(state) {
  const store = storage();
  if (!store) return false;

  try {
    store.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, state }));
    return true;
  } catch {
    // Most likely QuotaExceededError. Losing persistence is not worth taking
    // the UI down for, so this is swallowed deliberately.
    return false;
  }
}

export function clearState() {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    /* nothing useful to do */
  }
}

/**
 * Accept only entries that match the expected shape. A snapshot written by an
 * older build can be missing fields the current reducers assume exist, and a
 * half-valid array is worse than no array.
 */
export function validate(state) {
  if (!state || typeof state !== 'object') return undefined;

  const fuels = asArray(state.fuels).filter(
    (f) => isId(f?.id) && typeof f.name === 'string' && Number.isFinite(f.pricePerLitre),
  );
  const cars = asArray(state.cars).filter((c) => isId(c?.id) && typeof c.name === 'string');
  const reports = asArray(state.reports).filter(
    (r) =>
      isId(r?.id) &&
      Number.isFinite(r.routeKilometers) &&
      Number.isFinite(r.averageCombustion) &&
      Number.isFinite(r.averageSpeed),
  );

  return { fuels, cars, reports };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isId(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Redux middleware that mirrors the store into localStorage after each action.
 *
 * Writes are trailing-edge debounced: typing into a form dispatches on every
 * keystroke, and a synchronous JSON serialise per keystroke is measurable on a
 * long report list.
 */
export function persistenceMiddleware({ delay = 250, save = saveState } = {}) {
  let timer = null;

  return (store) => (next) => (action) => {
    const result = next(action);

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const { fuels, cars, reports } = store.getState();
      save({ fuels, cars, reports });
    }, delay);

    return result;
  };
}

export const STORAGE_KEY_FOR_TESTS = STORAGE_KEY;
export const SCHEMA_VERSION_FOR_TESTS = SCHEMA_VERSION;
