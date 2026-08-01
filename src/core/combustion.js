import { fitPolynomial } from './regression.js';

/**
 * Domain calculations over combustion reports. Framework-free and unit-tested;
 * see the note at the top of `regression.js`.
 *
 * Units throughout:
 *   - distance          km
 *   - consumption       litres per 100 km  (l/100km)
 *   - speed             km/h
 *   - fuel price        currency per litre
 */

/** Litres burned over a route. */
export function litresUsed(routeKilometers, litresPer100Km) {
  return (routeKilometers / 100) * litresPer100Km;
}

/** Money burned over a route, or NaN when the car has no fuel attached. */
export function routeCost(report, fuel) {
  if (!fuel || !Number.isFinite(fuel.pricePerLitre)) return Number.NaN;
  return litresUsed(report.routeKilometers, report.averageCombustion) * fuel.pricePerLitre;
}

/**
 * Summary statistics for a set of reports.
 *
 * `averageCombustion` is distance-weighted: a 5 km trip and a 900 km trip are
 * not equal evidence about a car, and averaging the two consumption figures
 * directly would treat them as if they were.
 */
export function summarize(reports) {
  const usable = (reports ?? []).filter(
    (r) => Number.isFinite(r.routeKilometers) && Number.isFinite(r.averageCombustion),
  );

  if (usable.length === 0) {
    return {
      count: 0,
      totalKilometers: 0,
      totalLitres: 0,
      averageCombustion: Number.NaN,
      bestCombustion: Number.NaN,
      worstCombustion: Number.NaN,
    };
  }

  const totalKilometers = usable.reduce((sum, r) => sum + r.routeKilometers, 0);
  const totalLitres = usable.reduce((sum, r) => sum + litresUsed(r.routeKilometers, r.averageCombustion), 0);
  const consumptions = usable.map((r) => r.averageCombustion);

  return {
    count: usable.length,
    totalKilometers,
    totalLitres,
    // Guard the zero-distance case: reports can legitimately all be 0 km.
    averageCombustion: totalKilometers > 0 ? (totalLitres / totalKilometers) * 100 : Number.NaN,
    bestCombustion: Math.min(...consumptions),
    worstCombustion: Math.max(...consumptions),
  };
}

/** Reports belonging to one car. */
export function reportsForCar(reports, carId) {
  return (reports ?? []).filter((r) => r.carId === carId);
}

/**
 * The two models the app charts for a car: consumption against average speed,
 * and consumption against route length.
 *
 * Returns well-formed (possibly `ok: false`) models in every case, so callers
 * never need to null-check before rendering.
 */
export function buildCarModels(reports, carId, options = {}) {
  const mine = reportsForCar(reports, carId);

  return {
    bySpeed: fitPolynomial(
      mine.map((r) => [r.averageSpeed, r.averageCombustion]),
      options,
    ),
    byDistance: fitPolynomial(
      mine.map((r) => [r.routeKilometers, r.averageCombustion]),
      options,
    ),
  };
}
