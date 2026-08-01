import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ItemList from '../components/ItemList.jsx';
import FieldError, { validationClass } from '../components/FieldError.jsx';
import { useForm } from '../hooks/useForm.js';
import { useI18n } from '../i18n/index.jsx';
import { formatNumber } from '../format.js';
import { fuelAdded, fuelRemoved, isDuplicateFuelName } from '../store/fuelsSlice.js';
import { validateName, validateNumber } from '../core/index.js';

const emptyForm = { name: '', pricePerLitre: '' };

export default function FuelsPage() {
  const { t, locale } = useI18n();
  const dispatch = useDispatch();
  const fuels = useSelector((state) => state.fuels);

  const validators = useMemo(
    () => ({
      // The pre-1.0 version called `this.props.fuelItems.filter(...)` where
      // `fuelItems` was the slice object, not the array — typing a name threw
      // "filter is not a function" and the duplicate check never ran at all.
      name: (value) => validateName(value, { isDuplicate: (candidate) => isDuplicateFuelName(fuels, candidate) }),
      pricePerLitre: (value) => validateNumber(value, { positive: true }),
    }),
    [fuels],
  );

  const form = useForm(emptyForm, validators);

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.valid) {
      form.touchAll();
      return;
    }
    dispatch(fuelAdded(form.values));
    form.reset();
  }

  const fields = [
    { name: 'name', label: t('fuels.name'), inputMode: 'text' },
    { name: 'pricePerLitre', label: t('fuels.pricePerLitre'), inputMode: 'decimal' },
  ];

  return (
    <>
      <h1 className="h3">{t('fuels.heading')}</h1>

      <div className="row g-4">
        <div className="col-12 col-md-5">
          <h2 className="h5">{t('fuels.addHeading')}</h2>
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
            <button className="btn btn-primary" disabled={!form.valid} type="submit">
              {t('common.add')}
            </button>
          </form>
        </div>

        <div className="col-12 col-md-7">
          <ItemList
            emptyMessage={t('fuels.none')}
            items={fuels.map((fuel) => ({
              id: fuel.id,
              label: t('fuels.item', {
                name: fuel.name,
                price: formatNumber(fuel.pricePerLitre, locale, { digits: 2 }),
              }),
            }))}
            onDelete={(id) => dispatch(fuelRemoved(id))}
          />
        </div>
      </div>
    </>
  );
}
