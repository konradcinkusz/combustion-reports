import { useI18n } from '../i18n/index.jsx';

/**
 * Renders one validation error beneath its field.
 *
 * `label` is the human name of the field, so the message reads as a sentence —
 * "Route length must be a number." — in both locales.
 */
export default function FieldError({ error, label }) {
  const { t } = useI18n();
  if (!error) return null;

  return (
    <div className="invalid-feedback d-block">
      {label} {t(error.key, error.params)}
    </div>
  );
}

/** Bootstrap validation class for an input, or '' while the field is untouched. */
export function validationClass(error, touched) {
  if (!touched) return '';
  return error ? 'is-invalid' : 'is-valid';
}
