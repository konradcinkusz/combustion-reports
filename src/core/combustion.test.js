import { describe, expect, it } from 'vitest';
import { buildCarModels, litresUsed, reportsForCar, routeCost, summarize } from './combustion.js';

const reports = [
  { id: 'a', carId: 'car-1', routeKilometers: 100, averageCombustion: 5, averageSpeed: 90 },
  { id: 'b', carId: 'car-1', routeKilometers: 300, averageCombustion: 7, averageSpeed: 110 },
  { id: 'c', carId: 'car-2', routeKilometers: 50, averageCombustion: 9, averageSpeed: 40 },
];

describe('litresUsed', () => {
  it('converts l/100km over a distance into litres', () => {
    expect(litresUsed(100, 5)).toBe(5);
    expect(litresUsed(250, 8)).toBe(20);
    expect(litresUsed(0, 8)).toBe(0);
  });
});

describe('routeCost', () => {
  it('multiplies litres burned by the fuel price', () => {
    const cost = routeCost({ routeKilometers: 100, averageCombustion: 5 }, { pricePerLitre: 6 });
    expect(cost).toBe(30);
  });

  it('is NaN when the car has no fuel attached', () => {
    expect(Number.isNaN(routeCost({ routeKilometers: 100, averageCombustion: 5 }, null))).toBe(true);
    expect(Number.isNaN(routeCost({ routeKilometers: 100, averageCombustion: 5 }, {}))).toBe(true);
  });
});

describe('summarize', () => {
  it('weights average consumption by distance, not by report count', () => {
    const summary = summarize(reportsForCar(reports, 'car-1'));

    // Naive mean of 5 and 7 would be 6. Distance-weighted: 5 l over 100 km plus
    // 21 l over 300 km is 26 l over 400 km => 6.5 l/100km.
    expect(summary.averageCombustion).toBeCloseTo(6.5, 10);
    expect(summary.totalLitres).toBeCloseTo(26, 10);
    expect(summary.totalKilometers).toBe(400);
    expect(summary.count).toBe(2);
    expect(summary.bestCombustion).toBe(5);
    expect(summary.worstCombustion).toBe(7);
  });

  it('returns a zeroed summary for no reports rather than NaN totals', () => {
    const summary = summarize([]);

    expect(summary.count).toBe(0);
    expect(summary.totalKilometers).toBe(0);
    expect(summary.totalLitres).toBe(0);
    expect(Number.isNaN(summary.averageCombustion)).toBe(true);
  });

  it('ignores reports with non-numeric fields', () => {
    const summary = summarize([...reports, { id: 'x', routeKilometers: 'abc', averageCombustion: null }]);
    expect(summary.count).toBe(3);
  });

  it('does not divide by zero when every report is 0 km', () => {
    const summary = summarize([{ routeKilometers: 0, averageCombustion: 6 }]);
    expect(Number.isNaN(summary.averageCombustion)).toBe(true);
    expect(summary.totalLitres).toBe(0);
  });

  it('handles a null report list', () => {
    expect(summarize(null).count).toBe(0);
  });
});

describe('reportsForCar', () => {
  it('filters by car id', () => {
    expect(reportsForCar(reports, 'car-1')).toHaveLength(2);
    expect(reportsForCar(reports, 'car-2')).toHaveLength(1);
    expect(reportsForCar(reports, 'missing')).toHaveLength(0);
  });
});

describe('buildCarModels', () => {
  it('always returns both models, even with no data', () => {
    const models = buildCarModels([], 'nobody');

    expect(models.bySpeed.ok).toBe(false);
    expect(models.byDistance.ok).toBe(false);
    // Rendering must not need a null check — this is the /route crash class.
    expect(models.bySpeed.points).toEqual([]);
  });

  it('fits speed and distance independently', () => {
    const many = [
      { carId: 'c', routeKilometers: 10, averageCombustion: 9, averageSpeed: 30 },
      { carId: 'c', routeKilometers: 100, averageCombustion: 7, averageSpeed: 70 },
      { carId: 'c', routeKilometers: 400, averageCombustion: 6, averageSpeed: 100 },
    ];
    const models = buildCarModels(many, 'c');

    expect(models.bySpeed.ok).toBe(true);
    expect(models.byDistance.ok).toBe(true);
    expect(models.bySpeed.points).toEqual([[30, 9], [70, 7], [100, 6]]);
    expect(models.byDistance.points).toEqual([[10, 9], [100, 7], [400, 6]]);
  });
});
