import { describe, expect, it } from 'vitest';
import { DEFAULT_ORDER, fitPolynomial, sampleCurve, sanitizePoints } from './regression.js';

describe('sanitizePoints', () => {
  it('keeps well-formed numeric pairs', () => {
    expect(sanitizePoints([[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]]);
  });

  it('coerces numeric strings', () => {
    expect(sanitizePoints([['10', '2.5']])).toEqual([[10, 2.5]]);
  });

  it('drops NaN, Infinity and malformed entries', () => {
    const input = [[1, 2], [Number.NaN, 3], [4, Number.POSITIVE_INFINITY], [5], 'nope', null];
    expect(sanitizePoints(input)).toEqual([[1, 2]]);
  });

  it('returns an empty array for non-array input', () => {
    expect(sanitizePoints(undefined)).toEqual([]);
    expect(sanitizePoints(null)).toEqual([]);
  });
});

describe('fitPolynomial', () => {
  it('recovers a known quadratic', () => {
    // y = x^2, sampled exactly; the fit should be near-perfect.
    const points = [[1, 1], [2, 4], [3, 9], [4, 16]];
    const model = fitPolynomial(points, { anchorAtOrigin: false });

    expect(model.ok).toBe(true);
    expect(model.r2).toBeCloseTo(1, 5);
    expect(model.predict(5)).toBeCloseTo(25, 3);
  });

  it('returns a readable, non-throwing model when there is too little data', () => {
    const model = fitPolynomial([[1, 2]], { anchorAtOrigin: false });

    expect(model.ok).toBe(false);
    // The pre-1.0 crash was a consumer reading these off `undefined`.
    expect(model.string).toBe('');
    expect(model.points).toEqual([[1, 2]]);
    expect(Number.isNaN(model.r2)).toBe(true);
    expect(Number.isNaN(model.predict(10))).toBe(true);
  });

  it('never throws on empty or junk input', () => {
    expect(fitPolynomial([]).ok).toBe(false);
    expect(fitPolynomial(null).ok).toBe(false);
    expect(fitPolynomial([['a', 'b']]).ok).toBe(false);
  });

  it('anchors at the origin by default, and the anchor changes the fit', () => {
    const points = [[10, 5], [20, 6], [30, 7]];

    const anchored = fitPolynomial(points);
    const free = fitPolynomial(points, { anchorAtOrigin: false });

    expect(anchored.ok).toBe(true);
    expect(free.ok).toBe(true);

    // The anchor is one more least-squares sample, not a hard constraint, so it
    // pulls the intercept towards zero rather than pinning it there.
    expect(Math.abs(anchored.predict(0))).toBeLessThan(Math.abs(free.predict(0)));
    // Without it the curve keeps the data's own intercept, well above zero.
    expect(free.predict(0)).toBeGreaterThan(1);
  });

  it('exposes the requested order even when the fit fails', () => {
    expect(fitPolynomial([], { order: 3 }).order).toBe(3);
    expect(fitPolynomial([]).order).toBe(DEFAULT_ORDER);
  });
});

describe('sampleCurve', () => {
  it('produces the requested number of evenly spaced samples', () => {
    const model = fitPolynomial([[1, 1], [2, 4], [3, 9]], { anchorAtOrigin: false });
    const curve = sampleCurve(model, { steps: 5, maxX: 4 });

    expect(curve.x).toHaveLength(5);
    expect(curve.y).toHaveLength(5);
    expect(curve.x[0]).toBe(0);
    expect(curve.x.at(-1)).toBe(4);
    // Evenly spaced, not the random sampling the pre-1.0 version used.
    expect(curve.x[1] - curve.x[0]).toBeCloseTo(curve.x[2] - curve.x[1], 10);
  });

  it('returns empty arrays for an unusable model', () => {
    expect(sampleCurve(fitPolynomial([]))).toEqual({ x: [], y: [] });
    expect(sampleCurve(null)).toEqual({ x: [], y: [] });
  });

  it('defaults the domain to just past the observed data', () => {
    const model = fitPolynomial([[10, 5], [20, 6], [30, 7]], { anchorAtOrigin: false });
    const curve = sampleCurve(model);

    expect(curve.x.at(-1)).toBeCloseTo(36, 5);
  });
});
