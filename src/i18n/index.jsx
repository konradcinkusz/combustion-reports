import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.js';
import pl from './pl.js';

/**
 * A deliberately small i18n layer — a dictionary, a context and a `t()`. The app
 * has one namespace and two locales; an i18n framework would be more
 * configuration than translation.
 *
 * The pre-1.0 UI was Polish-only with an English README, which made the project
 * hard to evaluate for anyone who does not read Polish.
 */

export const LOCALES = {
  en: { label: 'English', messages: en },
  pl: { label: 'Polski', messages: pl },
};

export const DEFAULT_LOCALE = 'en';

const STORAGE_KEY = 'combustion-reports/locale';

const I18nContext = createContext(null);

/** Prefer a stored choice, then the browser's, then English. */
function detectLocale() {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored && LOCALES[stored]) return stored;
  } catch {
    /* storage blocked — fall through to language detection */
  }

  const languages = globalThis.navigator?.languages ?? [];
  for (const tag of languages) {
    const base = String(tag).split('-')[0].toLowerCase();
    if (LOCALES[base]) return base;
  }
  return DEFAULT_LOCALE;
}

/**
 * Substitute `{placeholder}` tokens. Missing values render as the bare token so
 * a broken message is visible in the UI rather than silently blank.
 */
export function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match,
  );
}

export function I18nProvider({ children, initialLocale }) {
  const [locale, setLocaleState] = useState(() => initialLocale ?? detectLocale());

  const setLocale = useCallback((next) => {
    if (!LOCALES[next]) return;
    setLocaleState(next);
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, next);
    } catch {
      /* a non-persisted language choice still works for this session */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => {
    const messages = LOCALES[locale]?.messages ?? LOCALES[DEFAULT_LOCALE].messages;
    const t = (key, params) => {
      // Fall back to English, then to the key itself: an untranslated string
      // should degrade to something readable, never to "undefined".
      const template = messages[key] ?? LOCALES[DEFAULT_LOCALE].messages[key] ?? key;
      return interpolate(template, params);
    };
    return { locale, setLocale, t };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside an <I18nProvider>');
  return context;
}
