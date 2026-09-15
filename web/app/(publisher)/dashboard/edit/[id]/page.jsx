"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdForm from "@/components/AdForm";
import { useDashboard } from "@/lib/DashboardContext";
import { useTranslation } from "@/lib/i18n/LocaleContext";
import { ArrowLeft, Edit3, Loader2, Save, AlertCircle } from "lucide-react";

export default function EditAdPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { getAdById, updateAd } = useDashboard();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ad = getAdById(id);

  if (!ad) {
    return (
      <div className="max-w-xl mx-auto mt-20 animate-fadeIn text-center">
        <div className="bg-surface rounded-[2.5rem] p-12 shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-textMain mb-2">{t("dashboardEdit.notFoundTitle")}</h3>
          <p className="text-textMuted mb-8">
            {t("dashboardEdit.notFoundSubtitle")}
          </p>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-white font-bold shadow-md hover:bg-primaryHover transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("dashboardEdit.backToListings")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    const success = await updateAd(id, data);
    setIsSubmitting(false);
    if (success) {
      router.push("/dashboard/history");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn w-full relative">

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-textMuted hover:text-textMain font-medium transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {t("dashboardEdit.back")}
      </button>

      <section className="bg-surface rounded-[2rem] p-6 sm:p-10 shadow-sm border border-gray-100">

        <div className="flex items-start sm:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="bg-primary/10 p-3 sm:p-4 rounded-2xl flex-shrink-0">
            <Edit3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
              {t("dashboardEdit.title")}
            </h2>
            <p className="text-sm sm:text-base text-textMuted mt-1 leading-relaxed">
              {t("dashboardEdit.subtitle")}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <AdForm
            formId="edit-ad-form"
            initialValues={ad}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={t("dashboardEdit.updateListing")}
            submitIcon={Save}
          />
        </div>
      </section>

    </div>
  );
}
