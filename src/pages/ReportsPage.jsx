import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ItemList from '../components/ItemList.jsx';
import RegressionPlot from '../components/RegressionPlot.jsx';
import SummaryPanel from '../components/SummaryPanel.jsx';
import FieldError, { validationClass } from '../components/FieldError.jsx';
import { useForm } from '../hooks/useForm.js';
import { useI18n } from '../i18n/index.jsx';
import { formatNumber } from '../format.js';
import { reportAdded, reportRemoved } from '../store/reportsSlice.js';
import { buildCarModels, reportsForCar, routeCost, summarize, validateNumber } from '../core/index.js';

const validators = {
  routeKilometers: (value) => validateNumber(value, { positive: true }),
  averageCombustion: (value) => validateNumber(value, { positive: true }),
  averageSpeed: (value) => validateNumber(value, { positive: true }),
};

const emptyForm = { routeKilometers: '', averageCombustion: '', averageSpeed: '' };

export default function ReportsPage() {
  const { t, locale } = useI18n();
  const dispatch = useDispatch();

  const cars = useSelector((state) => state.cars);
  const fuels = useSelector((state) => state.fuels);
  const reports = useSelector((state) => state.reports);

  const [selectedCarId, setSelectedCarId] = useState(() => cars[0]?.id ?? '');
  // A car can disappear (deleted on the Cars page) while it is selected here.
  const activeCarId = cars.some((car) => car.id === selectedCarId) ? selectedCarId : (cars[0]?.id ?? '');
  const activeCar = cars.find((car) => car.id === activeCarId) ?? null;
  const activeFuel = fuels.find((fuel) => fuel.id === activeCar?.fuelId) ?? null;

  const form = useForm(emptyForm, validators);

  const carReports = useMemo(() => reportsForCar(reports, activeCarId), [reports, activeCarId]);
  const summary = useMemo(() => summarize(carReports), [carReports]);
  const models = useMemo(() => buildCarModels(reports, activeCarId), [reports, activeCarId]);

  const totalCost = useMemo(
    () =>
      activeFuel
        ? carReports.reduce((sum, report) => {
            const cost = routeCost(report, activeFuel);
            return Number.isFinite(cost) ? sum + cost : sum;
          }, 0)
        : Number.NaN,
    [carReports, activeFuel],
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.valid || !activeCarId) {
      form.touchAll();
      return;
    }
    dispatch(reportAdded({ carId: activeCarId, ...form.values }));
    form.reset();
  }

  if (cars.length === 0) {
    return (
      <>
        <h1 className="h3">{t('reports.heading')}</h1>
        <p className="text-body-secondary">{t('reports.noCars')}</p>
      </>
    );
  }

  return (
    <>
      <h1 className="h3">{t('reports.heading')}</h1>

      <div className="mb-4" style={{ maxWidth: '24rem' }}>
        <label className="form-label" htmlFor="car-select">
          {t('reports.selectCar')}
        </label>
        <select
          className="form-select"
          id="car-select"
          onChange={(event) => setSelectedCarId(event.target.value)}
          value={activeCarId}
        >
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.name}
            </option>
          ))}
        </select>
      </div>

      <SummaryPanel cost={totalCost} summary={summary} />

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6">
          <RegressionPlot
            model={models.bySpeed}
            title={t('plot.speedVsConsumption')}
            xAxisLabel={t('plot.axisSpeed')}
          />
        </div>
        <div className="col-12 col-lg-6">
          <RegressionPlot
            model={models.byDistance}
            title={t('plot.distanceVsConsumption')}
            xAxisLabel={t('plot.axisDistance')}
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-5">
          <h2 className="h5">{t('reports.addHeading')}</h2>
          <form noValidate onSubmit={handleSubmit}>
            {[
              { name: 'routeKilometers', label: t('reports.routeKilometers') },
              { name: 'averageCombustion', label: t('reports.averageCombustion') },
              { name: 'averageSpeed', label: t('reports.averageSpeed') },
            ].map((field) => (
              <div className="mb-3" key={field.name}>
                <label className="form-label" htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  className={`form-control ${validationClass(form.errors[field.name], form.touched[field.name])}`}
                  id={field.name}
                  inputMode="decimal"
                  name={field.name}
                  onBlur={form.handleBlur}
                  onChange={form.handleChange}
                  value={form.values[field.name]}
                />
                <FieldError error={form.errorFor(field.name)} label={field.label} />
              </div>
            ))}
            <button className="btn btn-primary" disabled={!form.valid} type="submit">
              {t('common.add')}
            </button>
          </form>
        </div>

        <div className="col-12 col-md-7">
          <h2 className="h5">{t('reports.listHeading')}</h2>
          <ItemList
            emptyMessage={t('reports.none')}
            items={carReports.map((report) => ({
              id: report.id,
              label: t('reports.item', {
                km: formatNumber(report.routeKilometers, locale, { digits: 0 }),
                consumption: formatNumber(report.averageCombustion, locale),
                speed: formatNumber(report.averageSpeed, locale, { digits: 0 }),
              }),
            }))}
            onDelete={(id) => dispatch(reportRemoved(id))}
          />
        </div>
      </div>
    </>
  );
}
