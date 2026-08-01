import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ItemList from '../components/ItemList.jsx';
import FieldError, { validationClass } from '../components/FieldError.jsx';
import { useForm } from '../hooks/useForm.js';
import { useI18n } from '../i18n/index.jsx';
import { formatNumber } from '../format.js';
import { carAdded, carRemoved, isDuplicateCarName } from '../store/carsSlice.js';
import { validateName, validateNumber } from '../core/index.js';

const emptyForm = { name: '', catalogueCityCombustion: '', catalogueRouteCombustion: '', fuelId: '' };

export default function CarsPage() {
  const { t, locale } = useI18n();
  const dispatch = useDispatch();
  const cars = useSelector((state) => state.cars);
  const fuels = useSelector((state) => state.fuels);

  // Rebuilt when the car list changes so the duplicate check always sees the
  // current names; `useForm` memoizes on the validators object identity.
  const validators = useMemo(
    () => ({
      name: (value) => validateName(value, { isDuplicate: (candidate) => isDuplicateCarName(cars, candidate) }),
      catalogueCityCombustion: (value) => validateNumber(value, { positive: true }),
      catalogueRouteCombustion: (value) => validateNumber(value, { positive: true }),
      fuelId: () => null,
    }),
    [cars],
  );

  const initial = useMemo(() => ({ ...emptyForm, fuelId: fuels[0]?.id ?? '' }), [fuels]);
  const form = useForm(initial, validators);

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.valid) {
      form.touchAll();
      return;
    }
    dispatch(carAdded(form.values));
    form.reset(initial);
  }

  const fields = [
    { name: 'name', label: t('cars.name'), inputMode: 'text' },
    { name: 'catalogueCityCombustion', label: t('cars.cityCombustion'), inputMode: 'decimal' },
    { name: 'catalogueRouteCombustion', label: t('cars.routeCombustion'), inputMode: 'decimal' },
  ];

  return (
    <>
      <h1 className="h3">{t('cars.heading')}</h1>

      <div className="row g-4">
        <div className="col-12 col-md-5">
          <h2 className="h5">{t('cars.addHeading')}</h2>
          <form noValidate onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div className="mb-3" key={field.name}>
                <label className="form-label" htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  className={`form-control ${validationClass(form.errors[field.name], form.touched[field.name])}`}
                  id={field.name}
                  inputMode={field.inputMode}
                  name={field.name}
                  onBlur={form.handleBlur}
                  onChange={form.handleChange}
                  value={form.values[field.name]}
                />
                <FieldError error={form.errorFor(field.name)} label={field.label} />
              </div>
            ))}

            <div className="mb-3">
              <label className="form-label" htmlFor="fuelId">
                {t('cars.fuel')}
              </label>
              <select
                className="form-select"
                id="fuelId"
                name="fuelId"
                onChange={form.handleChange}
                value={form.values.fuelId}
              >
                <option value="">{t('common.none')}</option>
                {fuels.map((fuel) => (
                  <option key={fuel.id} value={fuel.id}>
                    {fuel.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" disabled={!form.valid} type="submit">
              {t('common.add')}
            </button>
          </form>
        </div>

        <div className="col-12 col-md-7">
          <ItemList
            emptyMessage={t('cars.none')}
            items={cars.map((car) => ({
              id: car.id,
              label: t('cars.item', {
                name: car.name,
                city: formatNumber(car.catalogueCityCombustion, locale),
                route: formatNumber(car.catalogueRouteCombustion, locale),
                fuel: fuels.find((fuel) => fuel.id === car.fuelId)?.name ?? t('cars.noFuelAssigned'),
              }),
            }))}
            onDelete={(id) => dispatch(carRemoved(id))}
          />
        </div>
      </div>
    </>
  );
}
