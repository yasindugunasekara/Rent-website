"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getCurrencyCodes, getExchangeRate } from "@/lib/api-client";
import { FALLBACK_CURRENCIES } from "@/lib/currencies";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [rateStale, setRateStale] = useState(false);
  // Seeded with the static fallback list (lib/currencies.ts) so every
  // consumer — the public site's FloatingCurrency modal, and the dashboard's
  // CurrencySelect — has a populated list from the first render, not an
  // empty one waiting on a network call that might fail.
  const [availableCurrencies, setAvailableCurrencies] = useState(FALLBACK_CURRENCIES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount and fetch the live (richer) currency list
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("user-currency");
      if (savedCurrency) setCurrency(savedCurrency);
    } catch {
      // Storage unavailable — fall back to USD.
    }

    // On success this supersedes the fallback list with the full live set;
    // on failure the fallback list (already in state) just stays as-is.
    getCurrencyCodes()
      .then((codes) => {
        if (codes.length > 0) setAvailableCurrencies(codes);
      })
      .catch((error) => console.error("Error fetching currencies, using fallback list:", error));

    setIsHydrated(true);
  }, []);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (currency === "USD") {
      setExchangeRate(1.0);
      setRateStale(false);
      return;
    }
    getExchangeRate(currency)
      .then((data) => {
        setExchangeRate(data.rate);
        setRateStale(Boolean(data.stale));
      })
      .catch((error) => console.error("Error fetching exchange rate:", error));
  }, [currency]);

  // Save to localStorage when currency changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("user-currency", currency);
      } catch {
        // Storage unavailable — preference just won't persist.
      }
    }
  }, [currency, isHydrated]);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      availableCurrencies,
      isHydrated,
      rateStale,
      formatPrice: (usdPrice) => {
        const converted = usdPrice * exchangeRate;
        const rounded = Math.round(converted / 10) * 10;
        // If not yet hydrated, show simple USD format to avoid SSR mismatch
        if (!isHydrated) return `$${usdPrice}`;
        return `${rounded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
      },
    }),
    [currency, exchangeRate, availableCurrencies, isHydrated, rateStale],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
