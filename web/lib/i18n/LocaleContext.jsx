"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import en from "@/messages/en.json";
import si from "@/messages/si.json";
import ta from "@/messages/ta.json";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/lib/i18n/locales";

const MESSAGES = { en, si, ta };
const STORAGE_KEY = "user-locale";

const LocaleContext = createContext(null);

function lookup(messages, key) {
  return key.split(".").reduce((node, part) => (node && typeof node === "object" ? node[part] : undefined), messages);
}

// Modeled directly on CurrencyContext.js: client Context + localStorage +
// an isHydrated guard, matching the app's existing per-viewer-preference
// pattern instead of introducing a routing-based i18n library. No URL
// change on switch — every message file is small enough to import directly
// (no per-locale code splitting needed).
export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isSupportedLocale(saved)) setLocaleState(saved);
    } catch {
      // Storage unavailable — fall back to the default locale.
    }
    setIsHydrated(true);
  }, []);

  // Keep <html lang> in sync — screen readers and browser tooling (spell
  // check, translation prompts) read it, and the root layout can't know the
  // localStorage-backed locale at server-render time.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next) => {
    if (!isSupportedLocale(next)) return;
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — preference just won't persist.
    }
  }, []);

  // t("nav.signIn", { name: "Ava" }) — dot-path lookup into the current
  // locale's messages, falling back to English on a missing key (so a
  // partially-translated area never renders blank) and to the raw key as a
  // last resort (visible-but-not-crashing). {placeholder} tokens in the
  // resolved string are replaced from `vars`.
  const t = useCallback(
    (key, vars) => {
      const value = lookup(MESSAGES[locale], key) ?? lookup(MESSAGES[DEFAULT_LOCALE], key) ?? key;
      if (typeof value !== "string") return key;
      if (!vars) return value;
      return Object.entries(vars).reduce((str, [k, v]) => str.replaceAll(`{${k}}`, String(v)), value);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t, isHydrated }), [locale, setLocale, t, isHydrated]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LocaleProvider");
  }
  return context;
}
