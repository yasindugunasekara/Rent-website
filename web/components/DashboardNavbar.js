"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, PlusCircle, List, User, LogOut, Globe } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useDashboard } from "@/lib/DashboardContext";
import { useCurrency } from "@/lib/CurrencyContext";
import { useTranslation } from "@/lib/i18n/LocaleContext";
import CurrencySelect from "@/components/CurrencySelect";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LINKS = [
  { href: "/dashboard", key: "dashboardNav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/create", key: "dashboardNav.createAd", icon: PlusCircle },
  { href: "/dashboard/history", key: "dashboardNav.myListings", icon: List },
  { href: "/dashboard/profile", key: "dashboardNav.profile", icon: User },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useDashboard();
  // Shared list (live, falling back to the static set) — see lib/currencies.ts.
  const { availableCurrencies } = useCurrency();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    signOut("/login");
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-gray-100 transition-all duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand / Logo Area */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="bg-primary text-white p-1.5 rounded-lg group-hover:bg-primaryHover transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-extrabold text-textMain tracking-tight">
              Rent<span className="text-primary">Anything</span>
            </h1>
            <span className="hidden sm:inline-block text-xs font-bold text-textMuted border-l border-gray-300 pl-2 ml-1 uppercase tracking-wider">
              {t("dashboardNav.publisher")}
            </span>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active ? "bg-primary/10 text-primary" : "text-textMuted hover:bg-gray-50 hover:text-textMain"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-textMuted"}`} />
                  {t(link.key)}
                </Link>
              );
            })}

            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            {/* Currency Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
              <Globe className="w-4 h-4 text-textMuted" />
              <CurrencySelect value={currency} onChange={setCurrency} options={availableCurrencies} />
            </div>

            <LanguageSwitcher variant="light" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              {t("dashboardNav.signOut")}
            </button>
          </nav>

          {/* --- MOBILE MENU BUTTON --- */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-textMuted hover:bg-gray-100 hover:text-textMain transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Toggle Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* --- MOBILE DROPDOWN MENU --- */}
        <div
          className={`md:hidden absolute w-full overflow-hidden transition-all duration-300 ease-in-out bg-surface border-gray-100 ${
            open ? "max-h-72 border-b shadow-lg opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col p-4 space-y-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                    active ? "bg-primary/10 text-primary" : "text-textMuted hover:bg-gray-50 hover:text-textMain"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-textMuted"}`} />
                  {t(link.key)}
                </Link>
              );
            })}

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-textMuted border border-gray-100 bg-gray-50/50">
              <Globe className="w-5 h-5" />
              <span className="flex-1">{t("dashboardNav.currency")}</span>
              <CurrencySelect
                value={currency}
                onChange={setCurrency}
                options={availableCurrencies}
                className="bg-transparent font-bold text-textMain outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-textMuted border border-gray-100 bg-gray-50/50">
              <span className="flex-1">{t("nav.changeLanguage")}</span>
              <LanguageSwitcher variant="light" />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              {t("dashboardNav.signOut")}
            </button>
          </nav>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
