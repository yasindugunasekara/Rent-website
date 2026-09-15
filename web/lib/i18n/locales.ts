export interface LocaleInfo {
  code: string;
  /** Shown in the switcher, written in the language itself (not translated). */
  label: string;
}

export const LOCALES: LocaleInfo[] = [
  { code: "en", label: "English" },
  { code: "si", label: "සිංහල" },
  { code: "ta", label: "தமிழ்" },
];

export const DEFAULT_LOCALE = "en";

export function isSupportedLocale(code: string): boolean {
  return LOCALES.some((l) => l.code === code);
}
