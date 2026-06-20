"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // In a real app, this would come from a config file
  const API_BASE_URL = "http://localhost:5079/api";

  // Load from localStorage on mount and fetch currencies
  useEffect(() => {
    const savedCurrency = localStorage.getItem("user-currency");
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    const fetchCurrencies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Ads/currencies`);
        if (res.ok) {
          const data = await res.json();
          setAvailableCurrencies(data);
        }
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };

    fetchCurrencies();
    setIsHydrated(true);
  }, []);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    const fetchRate = async () => {
      if (currency === "USD") {
        setExchangeRate(1.0);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/Ads/exchange-rate?to=${currency}`);
        if (res.ok) {
          const data = await res.json();
          setExchangeRate(data.rate);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };

    fetchRate();
  }, [currency]);

  // Save to localStorage when currency changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("user-currency", currency);
    }
  }, [currency, isHydrated]);

  const value = useMemo(() => ({
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
    }
  }), [currency, exchangeRate, availableCurrencies, isHydrated]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
