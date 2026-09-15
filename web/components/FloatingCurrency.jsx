"use client";

import { X, Search, AlertTriangle } from "lucide-react";
import { useCurrency } from "../lib/CurrencyContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "../lib/i18n/LocaleContext";
import { SUGGESTED_CURRENCY_CODES } from "../lib/currencies";

export default function FloatingCurrency() {
  const { currency, setCurrency, availableCurrencies, rateStale } = useCurrency();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Removed the pathname restriction so it's available everywhere in the header
  // if (pathname !== "/") return null;

  const query = searchQuery.toLowerCase().trim();
  const isSearching = query.length > 0;

  const filteredAvailable = availableCurrencies.filter(
    (c) =>
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query)
  );

  const suggested = filteredAvailable.filter((c) =>
    SUGGESTED_CURRENCY_CODES.includes(c.code)
  );
  
  const others = filteredAvailable.filter(
    (c) => !SUGGESTED_CURRENCY_CODES.includes(c.code)
  );

  const handleSelect = (code) => {
    setCurrency(code);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Header Inline Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all group"
      >
        
        
        <span className="text-sm font-bold text-white uppercase tracking-wide">{currency}</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery("");
            }}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t("floatingCurrency.title")}</h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("floatingCurrency.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                />
              </div>

              {rateStale && (
                <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {t("floatingCurrency.rateOutdated")}
                </div>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {filteredAvailable.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">{t("floatingCurrency.noCurrenciesFound", { query: searchQuery })}</p>
                </div>
              ) : isSearching ? (
                /* Search Results Section */
                <section>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    {t("floatingCurrency.searchResults")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredAvailable.map((c) => (
                      <CurrencyButton
                        key={c.code}
                        code={c.code}
                        name={c.name}
                        isSelected={currency === c.code}
                        onClick={() => handleSelect(c.code)}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                /* Default State Sections */
                <>
                  {/* Suggested Section */}
                  {suggested.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        {t("floatingCurrency.suggestedForYou")}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {suggested.map((c) => (
                          <CurrencyButton
                            key={c.code}
                            code={c.code}
                            name={c.name}
                            isSelected={currency === c.code}
                            onClick={() => handleSelect(c.code)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* All Currencies Section */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      {t("floatingCurrency.allCurrencies")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(others.length > 0 ? others : filteredAvailable).map((c) => (
                        <CurrencyButton
                          key={c.code}
                          code={c.code}
                          name={c.name}
                          isSelected={currency === c.code}
                          onClick={() => handleSelect(c.code)}
                        />
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CurrencyButton({ code, name, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-start p-4 rounded-xl border transition-all text-left
        ${isSelected 
          ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" 
          : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
        }
      `}
    >
      <span className={`text-sm font-bold ${isSelected ? "text-blue-600" : "text-gray-900"}`}>
        {code}
      </span>
      <span className="text-xs text-gray-500 line-clamp-1">
        {name}
      </span>
    </button>
  );
}
