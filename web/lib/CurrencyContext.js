"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getCurrencyCodes, getExchangeRate } from "@/lib/api-client";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount and fetch currencies
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("user-currency");
      if (savedCurrency) setCurrency(savedCurrency);
    } catch {
      // Storage unavailable — fall back to USD.
    }

    getCurrencyCodes()
      .then(setAvailableCurrencies)
      .catch((error) => console.error("Error fetching currencies:", error));

    setIsHydrated(true);
  }, []);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (currency === "USD") {
      setExchangeRate(1.0);
      return;
    }
    getExchangeRate(currency)
      .then((data) => setExchangeRate(data.rate))
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
      formatPrice: (usdPrice) => {
        const converted = usdPrice * exchangeRate;
        const rounded = Math.round(converted / 10) * 10;
        // If not yet hydrated, show simple USD format to avoid SSR mismatch
        if (!isHydrated) return `$${usdPrice}`;
        return `${rounded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
      },
    }),
    [currency, exchangeRate, availableCurrencies, isHydrated],
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
