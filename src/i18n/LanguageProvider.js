'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dictionaries, DEFAULT_LANG, SUPPORTED_LANGS } from './dictionaries';
import { setFormatLocale } from '@/utils/format';

const STORAGE_KEY = 'neon_ledger:lang';
const LOCALES = { es: 'es-MX', en: 'en-US' };

function getFromPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => (params[key] != null ? params[key] : `{${key}}`));
}

/** Crea una función de traducción para un idioma dado. */
export function makeT(lang) {
  return (path, params) => {
    const value = getFromPath(dictionaries[lang], path);
    const fallback = value == null ? getFromPath(dictionaries[DEFAULT_LANG], path) : value;
    if (fallback == null) return path;
    return typeof fallback === 'string' ? interpolate(fallback, params) : fallback;
  };
}

// Valor por defecto (sin proveedor): idioma por defecto. Evita fallos si un
// componente se renderiza fuera del proveedor (p. ej. en pruebas unitarias).
const defaultValue = {
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: makeT(DEFAULT_LANG),
  locale: LOCALES[DEFAULT_LANG],
  months: dictionaries[DEFAULT_LANG].months,
};

const LanguageContext = createContext(defaultValue);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        setLangState(saved);
        setFormatLocale(LOCALES[saved]);
      }
    } catch {
      /* noop */
    }
  }, []);

  const setLang = useCallback((next) => {
    if (!SUPPORTED_LANGS.includes(next)) return;
    setLangState(next);
    setFormatLocale(LOCALES[next]);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: makeT(lang),
      locale: LOCALES[lang],
      months: dictionaries[lang].months,
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
