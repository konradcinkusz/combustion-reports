import { describe, expect, it } from 'vitest';
import { createAppStore } from './index.js';
import { carAdded, carRemoved, isDuplicateCarName } from './carsSlice.js';
import { fuelAdded, fuelRemoved, isDuplicateFuelName } from './fuelsSlice.js';
import { reportAdded, reportRemoved } from './reportsSlice.js';

/** A store with no persisted snapshot, so it starts from the seed data. */
const freshStore = () => createAppStore(undefined);

describe('fuels', () => {
  it('adds a fuel with a generated id and coerced price', () => {
    const store = freshStore();
    store.dispatch(fuelAdded({ name: '  LPG  ', pricePerLitre: '3.19' }));

    const added = store.getState().fuels.at(-1);
    expect(added.name).toBe('LPG');
    expect(added.pricePerLitre).toBe(3.19);
    expect(added.id).toBeTruthy();
  });

  it('removes a fuel by id', () => {
    const store = freshStore();
    const target = store.getState().fuels[0].id;
    store.dispatch(fuelRemoved(target));

    expect(store.getState().fuels.some((f) => f.id === target)).toBe(false);
  });

  it('detects duplicate names case-insensitively', () => {
    const fuels = [{ id: 'f1', name: 'Pb95' }];
    expect(isDuplicateFuelName(fuels, 'pb95')).toBe(true);
    expect(isDuplicateFuelName(fuels, 'Pb95', 'f1')).toBe(false);
    expect(isDuplicateFuelName(fuels, '')).toBe(false);
  });
});

describe('cars', () => {
  it('adds a car and coerces catalogue figures to numbers', () => {
    const store = freshStore();
    store.dispatch(
      carAdded({ name: 'Skoda', fuelId: 'seed-fuel-pb95', catalogueCityCombustion: '9.1', catalogueRouteCombustion: '5' }),
    );

    const added = store.getState().cars.at(-1);
    expect(added.catalogueCityCombustion).toBe(9.1);
    expect(added.catalogueRouteCombustion).toBe(5);
  });

  it('stores a null fuelId when none is chosen', () => {
    const store = freshStore();
    store.dispatch(carAdded({ name: 'Fiat', fuelId: '', catalogueCityCombustion: 7, catalogueRouteCombustion: 5 }));

    expect(store.getState().cars.at(-1).fuelId).toBeNull();
  });

  it('detects duplicate names case-insensitively', () => {
    expect(isDuplicateCarName([{ id: 'c1', name: 'Mazda 6' }], 'mazda 6')).toBe(true);
  });
});

describe('referential integrity', () => {
  it('deleting a car also deletes its reports', () => {
    const store = freshStore();
    const carId = 'seed-car-mazda';
    expect(store.getState().reports.some((r) => r.carId === carId)).toBe(true);

    store.dispatch(carRemoved(carId));

    expect(store.getState().reports.some((r) => r.carId === carId)).toBe(false);
    // Other cars' reports are untouched.
    expect(store.getState().reports.some((r) => r.carId === 'seed-car-toyota')).toBe(true);
  });

  it('deleting a fuel detaches it from cars instead of leaving a dangling id', () => {
    const store = freshStore();
    store.dispatch(fuelRemoved('seed-fuel-pb95'));

    const mazda = store.getState().cars.find((c) => c.id === 'seed-car-mazda');
    expect(mazda.fuelId).toBeNull();
    // The other car keeps its own fuel.
    expect(store.getState().cars.find((c) => c.id === 'seed-car-toyota').fuelId).toBe('seed-fuel-diesel');
  });
});

describe('reports', () => {
  it('adds a report against a car with coerced numbers', () => {
    const store = freshStore();
    store.dispatch(
      reportAdded({ carId: 'seed-car-mazda', routeKilometers: '250', averageCombustion: '6.4', averageSpeed: '88' }),
    );

    const added = store.getState().reports.at(-1);
    expect(added).toMatchObject({
      carId: 'seed-car-mazda',
      routeKilometers: 250,
      averageCombustion: 6.4,
      averageSpeed: 88,
    });
  });

  it('removes a report by id', () => {
    const store = freshStore();
    const target = store.getState().reports[0].id;
    store.dispatch(reportRemoved(target));

    expect(store.getState().reports.some((r) => r.id === target)).toBe(false);
  });
});

describe('createAppStore', () => {
  it('prefers a supplied snapshot over the seed data', () => {
    const store = createAppStore({ fuels: [], cars: [], reports: [] });

    expect(store.getState().cars).toEqual([]);
    expect(store.getState().reports).toEqual([]);
  });
});
