import { describe, expect, it } from 'vitest';
import { validateAll, validateName, validateNumber } from './validation.js';

describe('validateName', () => {
  it('accepts a name at or above the minimum length', () => {
    expect(validateName('Mazda')).toBeNull();
  });

  it('rejects empty and whitespace-only input as required', () => {
    expect(validateName('')).toEqual({ key: 'validation.required' });
    expect(validateName('   ')).toEqual({ key: 'validation.required' });
    expect(validateName(undefined)).toEqual({ key: 'validation.required' });
  });

  it('reports the configured minimum in the error params', () => {
    expect(validateName('ab')).toEqual({ key: 'validation.tooShort', params: { min: 3 } });
    expect(validateName('abcd', { min: 5 })).toEqual({ key: 'validation.tooShort', params: { min: 5 } });
  });

  it('detects duplicates through the supplied predicate', () => {
    const isDuplicate = (name) => name.toLowerCase() === 'pb95';
    expect(validateName('Pb95', { isDuplicate })).toEqual({ key: 'validation.duplicate' });
    expect(validateName('Diesel', { isDuplicate })).toBeNull();
  });

  it('trims before checking, so " Pb95 " is still a duplicate', () => {
    const isDuplicate = (name) => name === 'Pb95';
    expect(validateName('  Pb95  ', { isDuplicate })).toEqual({ key: 'validation.duplicate' });
  });
});

describe('validateNumber', () => {
  it('accepts integers, decimals and numeric strings', () => {
    expect(validateNumber('7')).toBeNull();
    expect(validateNumber('7.5')).toBeNull();
    expect(validateNumber(7.5)).toBeNull();
  });

  it('rejects trailing-garbage input that parseFloat would have accepted', () => {
    // parseFloat('12abc') === 12; the pre-1.0 validator stored that as valid.
    expect(validateNumber('12abc')).toEqual({ key: 'validation.numbersOnly' });
  });

  it('rejects non-numeric text', () => {
    expect(validateNumber('abc')).toEqual({ key: 'validation.numbersOnly' });
  });

  it('treats empty as required by default and optional on request', () => {
    expect(validateNumber('')).toEqual({ key: 'validation.required' });
    expect(validateNumber('', { required: false })).toBeNull();
  });

  it('enforces positivity when asked', () => {
    expect(validateNumber('0', { positive: true })).toEqual({ key: 'validation.positive' });
    expect(validateNumber('-4', { positive: true })).toEqual({ key: 'validation.positive' });
    expect(validateNumber('0')).toBeNull();
  });
});

describe('validateAll', () => {
  it('collects errors per field and reports overall validity', () => {
    const result = validateAll(
      { name: 'ab', price: 'x' },
      { name: (v) => validateName(v), price: (v) => validateNumber(v) },
    );

    expect(result.valid).toBe(false);
    expect(result.errors.name.key).toBe('validation.tooShort');
    expect(result.errors.price.key).toBe('validation.numbersOnly');
  });

  it('is valid when every validator passes', () => {
    const result = validateAll({ name: 'Mazda' }, { name: (v) => validateName(v) });
    expect(result).toEqual({ errors: {}, valid: true });
  });
});
