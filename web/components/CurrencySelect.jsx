"use client";

import { FALLBACK_CURRENCIES } from "@/lib/currencies";

// Shared <select> currency picker — the single implementation used by
// DashboardNavbar (desktop + mobile) and ProfileForm, which previously each
// hardcoded their own independent 5-currency <option> list. `options`
// defaults to the static fallback list but the caller can pass the richer
// live list (e.g. from useCurrency()) once it's loaded. `withNames` shows
// "CODE - Name" (ProfileForm's style) instead of just the code (the compact
// nav style) — same data source either way, just a label format choice.
export default function CurrencySelect({
  value,
  onChange,
  options = FALLBACK_CURRENCIES,
  className,
  withNames = false,
  ...rest
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? "bg-transparent text-sm font-bold text-textMain outline-none cursor-pointer"}
      {...rest}
    >
      {options.map((c) => (
        <option key={c.code} value={c.code}>
          {withNames ? `${c.code} - ${c.name}` : c.code}
        </option>
      ))}
    </select>
  );
}
