import { useCallback, useMemo, useState } from 'react';
import { validateAll } from '../core/validation.js';

/**
 * Controlled-form state with validation.
 *
 * Errors are only surfaced for fields the user has actually touched, so a form
 * does not greet you in red before you have typed anything — while `valid`
 * always reflects every field, so the submit button is honest from the start.
 *
 * This replaces the hand-rolled `validateField`/`validateForm`/`setEventState`
 * trio that was copy-pasted into four components, each with its own `_inputRef`
 * DOM reads and a `'clean'` pseudo-field to reset state.
 */
export function useForm(initialValues, validators) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});

  const { errors, valid } = useMemo(() => validateAll(values, validators), [values, validators]);

  const setValue = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }, []);

  const reset = useCallback(
    (next = initialValues) => {
      setValues(next);
      setTouched({});
    },
    [initialValues],
  );

  /** Reveal every error at once — used when submit is attempted. */
  const touchAll = useCallback(() => {
    setTouched(Object.fromEntries(Object.keys(validators).map((field) => [field, true])));
  }, [validators]);

  const errorFor = useCallback((field) => (touched[field] ? (errors[field] ?? null) : null), [errors, touched]);

  return { values, errors, valid, touched, setValue, handleChange, handleBlur, reset, touchAll, errorFor };
}
