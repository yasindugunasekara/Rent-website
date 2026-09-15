"use client";

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import { useDashboard } from "@/lib/DashboardContext";
import { useTranslation } from "@/lib/i18n/LocaleContext";
import { UserCircle2, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile, loading } = useDashboard();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    await updateProfile(data);
    setIsSubmitting(false);
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-textMuted font-medium">{t("dashboardProfile.loadingProfile")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn w-full">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
          <UserCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
            {t("dashboardProfile.title")}
          </h2>
          <p className="text-sm sm:text-base text-textMuted mt-1 leading-relaxed">
            {t("dashboardProfile.subtitle")}
          </p>
        </div>
      </div>

      {/* PROFILE FORM COMPONENT */}
      <div className="mt-4">
        <ProfileForm
          initialValues={profile}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

    </div>
  );
}