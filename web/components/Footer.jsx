"use client";

import { useTranslation } from "../lib/i18n/LocaleContext";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#003B95] text-white py-12 mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-black tracking-tight">
              Open<span className="text-white/80">RentO</span>.com
            </h2>
            <p className="text-blue-100/70 text-sm mt-1.5 font-medium">{t("footer.tagline")}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-blue-100/90">
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.aboutUs")}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.contactSupport")}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.termsOfService")}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.privacyPolicy")}
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-xs text-blue-100/50 font-medium">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
