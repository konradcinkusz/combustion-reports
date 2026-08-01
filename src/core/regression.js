import regression from 'regression';

/**
 * Framework-free polynomial regression over combustion samples.
 *
 * Everything in `src/core` is deliberately free of React, Redux and the DOM: it
 * is the domain layer, it is unit-tested directly, and it is the part that would
 * move to a server project unchanged if this app ever grows a backend.
 */

export const DEFAULT_ORDER = 2;

/**
 * A model that could not be fitted. Returned instead of `null`/`undefined` so
 * every consumer can read `.r2`, `.string` and `.points` without a guard.
 *
 * The original code returned the raw library object and the UI read
 * `props.regression.string` directly, which crashed any caller that had no model
 * to pass (see the /route page). A total shape removes that failure mode.
 */
const EMPTY_MODEL = Object.freeze({
  ok: false,
  order: DEFAULT_ORDER,
  coefficients: [],
  string: '',
  r2: Number.NaN,
  points: [],
  predict: () => Number.NaN,
});

/**
 * Fit a polynomial to `[x, y]` pairs.
 *
 * @param {Array<[number, number]>} points raw samples
 * @param {object} [options]
 * @param {number} [options.order=2] polynomial degree
 * @param {boolean} [options.anchorAtOrigin=true] prepend a synthetic `[0, 0]`
 *   sample. This is not physically true — a car idling at 0 km/h still burns
 *   fuel — but with only a handful of real samples an unanchored fit swings
 *   wildly outside the sampled range. It reproduces the original app's
 *   behaviour and is opt-out rather than hidden.
 * @returns {typeof EMPTY_MODEL} a model that is always safe to read
 */
export function fitPolynomial(points, options = {}) {
  const { order = DEFAULT_ORDER, anchorAtOrigin = true } = options;

  const clean = sanitizePoints(points);
  const data = anchorAtOrigin ? [[0, 0], ...clean] : clean;

  // `regression` needs at least order+1 distinct points to solve the system;
  // below that it returns NaN coefficients rather than throwing.
  if (data.length < order + 1) {
    return { ...EMPTY_MODEL, order, points: clean };
  }

  let result;
  try {
    result = regression.polynomial(data, { order, precision: 6 });
  } catch {
    return { ...EMPTY_MODEL, order, points: clean };
  }

  const coefficients = Array.isArray(result.equation) ? result.equation : [];
  const usable = coefficients.length > 0 && coefficients.every(Number.isFinite) && Number.isFinite(result.r2);

  if (!usable) {
    return { ...EMPTY_MODEL, order, points: clean };
  }

  return {
    ok: true,
    order,
    coefficients,
    string: result.string,
    r2: result.r2,
    points: clean,
    predict: (x) => {
      const predicted = result.predict(x);
      return Array.isArray(predicted) ? predicted[1] : Number.NaN;
    },
  };
}

/**
 * Drop samples that cannot take part in a fit: non-numeric, infinite or NaN.
 * Bad input used to reach the plotting layer and surface as an empty chart with
 * no explanation.
 */
export function sanitizePoints(points) {
  if (!Array.isArray(points)) return [];
  return points
    .filter((p) => Array.isArray(p) && p.length >= 2)
    .map(([x, y]) => [Number(x), Number(y)])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
}

/**
 * Sample a fitted model into a polyline for charting.
 *
 * The original generated the x values with `tf.randomUniform` from TensorFlow.js
 * — roughly a megabyte of dependency, plus a "WebGL is not supported" warning on
 * every headless run — then sorted them. Evenly spaced samples are cheaper,
 * deterministic, and produce a smoother curve.
 *
 * @returns {{x: number[], y: number[]}} empty arrays when the model is not usable
 */
export function sampleCurve(model, { steps = 120, maxX } = {}) {
  if (!model || !model.ok || steps < 2) return { x: [], y: [] };

  const limit = Number.isFinite(maxX) ? maxX : defaultDomain(model);
  if (!Number.isFinite(limit) || limit <= 0) return { x: [], y: [] };

  const x = [];
  const y = [];
  for (let i = 0; i < steps; i += 1) {
    const xi = (limit * i) / (steps - 1);
    const yi = model.predict(xi);
    if (Number.isFinite(yi)) {
      x.push(xi);
      y.push(yi);
    }
  }
  return { x, y };
}

/**
 * How far past the observed data to draw the curve. The original extrapolated to
 * 3x the largest sample, which pushed a degree-2 fit into visibly nonsense
 * territory; 1.2x shows the trend without inventing one.
 */
function defaultDomain(model) {
  const largestX = model.points.reduce((max, [x]) => (x > max ? x : max), 0);
  return largestX > 0 ? largestX * 1.2 : Number.NaN;
}
