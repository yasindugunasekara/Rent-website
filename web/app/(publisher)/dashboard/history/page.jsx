"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PackageSearch, Plus, LayoutGrid, AlertCircle, Loader2 } from "lucide-react";
import AdCard from "@/components/AdCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useDashboard } from "@/lib/DashboardContext";
import { useTranslation } from "@/lib/i18n/LocaleContext";

export default function HistoryPage() {
  const { ads, deleteAd, loading } = useDashboard();
  const { t } = useTranslation();
  const [selectedAd, setSelectedAd] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedAd) return;
    setDeleting(true);
    await deleteAd(selectedAd.id);
    setDeleting(false);
    setSelectedAd(null);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto animate-fadeIn transition-all duration-700 ease-out transform ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}>

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">
              {t("dashboardHistory.title")}
            </h2>
          </div>
          <p className="text-base text-textMuted leading-relaxed">
            {t("dashboardHistory.subtitle", { count: ads.length })}
          </p>
        </div>

        {ads.length > 0 && (
          <Link
            href="/dashboard/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primaryHover hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={20} />
            {t("dashboardHistory.createNewListing")}
          </Link>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-textMuted font-medium">{t("dashboardHistory.loadingListings")}</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-surface border border-gray-100 p-12 sm:p-24 text-center shadow-sm">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative rounded-full bg-background border border-gray-100 p-8">
              <PackageSearch size={64} className="text-gray-300" />
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-textMain mb-3">{t("dashboardHistory.emptyTitle")}</h3>
          <p className="text-lg text-textMuted max-w-md mx-auto mb-10 leading-relaxed">
            {t("dashboardHistory.emptySubtitle")}
          </p>

          <Link
            href="/dashboard/create"
            className="group flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-xl font-bold text-white shadow-xl shadow-primary/20 transition-all duration-300 hover:bg-primaryHover hover:shadow-2xl hover:-translate-y-1 active:scale-95"
          >
            <Plus size={24} className="transition-transform group-hover:rotate-90" />
            {t("dashboardHistory.postFirstAd")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} onDeleteClick={setSelectedAd} />
          ))}
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      <ConfirmModal
        isOpen={Boolean(selectedAd)}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{t("dashboardHistory.deleteTitle")}</span>
          </div>
        }
        message={
          <span className="text-textMuted leading-relaxed">
            {t("dashboardHistory.deleteMessage", { title: selectedAd?.title ?? "" })}
          </span>
        }
        onCancel={() => setSelectedAd(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
