import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearState,
  loadState,
  persistenceMiddleware,
  saveState,
  validate,
  STORAGE_KEY_FOR_TESTS as KEY,
  SCHEMA_VERSION_FOR_TESTS as VERSION,
} from './persistence.js';

const sample = {
  fuels: [{ id: 'f1', name: 'Pb95', pricePerLitre: 6.29 }],
  cars: [{ id: 'c1', name: 'Mazda', fuelId: 'f1', catalogueCityCombustion: 8, catalogueRouteCombustion: 5 }],
  reports: [{ id: 'r1', carId: 'c1', routeKilometers: 100, averageCombustion: 6, averageSpeed: 90 }],
};

beforeEach(() => {
  globalThis.localStorage.clear();
});

describe('saveState / loadState', () => {
  it('round-trips a state snapshot', () => {
    expect(saveState(sample)).toBe(true);
    expect(loadState()).toEqual(sample);
  });

  it('returns undefined when nothing is stored', () => {
    expect(loadState()).toBeUndefined();
  });

  it('discards a snapshot written by a different schema version', () => {
    globalThis.localStorage.setItem(KEY, JSON.stringify({ version: VERSION + 1, state: sample }));
    expect(loadState()).toBeUndefined();
  });

  it('survives a corrupt entry instead of throwing at startup', () => {
    globalThis.localStorage.setItem(KEY, '{not json');
    expect(loadState()).toBeUndefined();
  });

  it('clears the stored snapshot', () => {
    saveState(sample);
    clearState();
    expect(loadState()).toBeUndefined();
  });
});

describe('validate', () => {
  it('drops entries missing required numeric fields', () => {
    const result = validate({
      fuels: [{ id: 'f1', name: 'Pb95', pricePerLitre: 6 }, { id: 'f2', name: 'Bad' }],
      cars: [{ id: 'c1', name: 'Ok' }, { name: 'No id' }],
      reports: [
        { id: 'r1', routeKilometers: 1, averageCombustion: 2, averageSpeed: 3 },
        { id: 'r2', routeKilometers: 'x', averageCombustion: 2, averageSpeed: 3 },
      ],
    });

    expect(result.fuels).toHaveLength(1);
    expect(result.cars).toHaveLength(1);
    expect(result.reports).toHaveLength(1);
  });

  it('coerces missing collections to empty arrays', () => {
    expect(validate({})).toEqual({ fuels: [], cars: [], reports: [] });
  });

  it('rejects non-object input', () => {
    expect(validate(null)).toBeUndefined();
    expect(validate('nope')).toBeUndefined();
  });
});

describe('persistenceMiddleware', () => {
  it('debounces writes and persists the latest state once', () => {
    vi.useFakeTimers();
    const save = vi.fn();
    const store = { getState: () => sample };
    const invoke = persistenceMiddleware({ delay: 250, save })(store)((action) => action);

    invoke({ type: 'a' });
    invoke({ type: 'b' });
    invoke({ type: 'c' });
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(sample);

    vi.useRealTimers();
  });

  it('passes the action through to the next middleware untouched', () => {
    const next = vi.fn((action) => ({ ...action, seen: true }));
    const invoke = persistenceMiddleware({ save: vi.fn() })({ getState: () => sample })(next);

    const result = invoke({ type: 'test' });

    expect(next).toHaveBeenCalledWith({ type: 'test' });
    expect(result).toEqual({ type: 'test', seen: true });
  });
});
