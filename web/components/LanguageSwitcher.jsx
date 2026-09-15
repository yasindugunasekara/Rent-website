"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LocaleContext";
import { LOCALES } from "@/lib/i18n/locales";

// Replaces the old static flag-icon stub in Navbar.jsx — a real dropdown.
// Text labels (not flags): Tamil isn't tied to one country's flag, and a
// Sri Lanka flag for Sinhala would misrepresent the language as being about
// the country rather than the language itself.
export default function LanguageSwitcher({ variant = "dark" }) {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const isDark = variant === "dark";
  const buttonClass = isDark
    ? "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors text-white"
    : "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-textMuted";

  return (
    <div className="relative">
      <button onClick={() => setIsOpen((v) => !v)} className={buttonClass} aria-label="Change language">
        <Globe className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[105]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-[110] overflow-hidden">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLocale(l.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                  locale === l.code ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
