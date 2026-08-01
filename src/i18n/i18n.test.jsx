import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, interpolate, useI18n, LOCALES, DEFAULT_LOCALE } from './index.jsx';
import en from './en.js';
import pl from './pl.js';

function Probe() {
  const { t, locale, setLocale } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="value">{t('nav.reports')}</span>
      <span data-testid="missing">{t('does.not.exist')}</span>
      <button onClick={() => setLocale('pl')} type="button">
        pl
      </button>
    </div>
  );
}

describe('interpolate', () => {
  it('substitutes named placeholders', () => {
    expect(interpolate('{a} then {b}', { a: 'x', b: 'y' })).toBe('x then y');
  });

  it('leaves unknown placeholders visible rather than blanking them', () => {
    expect(interpolate('{a} and {b}', { a: 'x' })).toBe('x and {b}');
  });

  it('returns the template untouched when no params are given', () => {
    expect(interpolate('plain')).toBe('plain');
  });
});

describe('catalogues', () => {
  it('define the same keys in every locale', () => {
    // A key present in one catalogue and missing in another shows up as English
    // text in a Polish UI, which is easy to ship and hard to notice.
    expect(Object.keys(pl).sort()).toEqual(Object.keys(en).sort());
  });

  it('has no empty translations', () => {
    for (const [code, { messages }] of Object.entries(LOCALES)) {
      for (const [key, value] of Object.entries(messages)) {
        expect(value, `${code}:${key}`).not.toBe('');
      }
    }
  });
});

describe('I18nProvider', () => {
  it('renders the requested locale', () => {
    render(
      <I18nProvider initialLocale="pl">
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('value')).toHaveTextContent('Raporty');
  });

  it('switches locale at runtime', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('value')).toHaveTextContent('Reports');
    await user.click(screen.getByRole('button', { name: 'pl' }));
    expect(screen.getByTestId('value')).toHaveTextContent('Raporty');
  });

  it('falls back to the key itself for an unknown message', () => {
    render(
      <I18nProvider initialLocale="en">
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('missing')).toHaveTextContent('does.not.exist');
  });

  it('defaults to English', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('throws a useful error when the hook is used outside the provider', () => {
    // React logs the error boundary trace; the assertion is on the message.
    expect(() => render(<Probe />)).toThrow(/must be used inside an <I18nProvider>/);
  });
});
