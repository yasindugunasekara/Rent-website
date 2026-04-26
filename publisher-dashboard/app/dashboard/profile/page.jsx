"use client";

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import { useDashboard } from "@/lib/DashboardContext";
// Modern UI සඳහා Icon එකතු කළා
import { UserCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateProfile(data);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn w-full">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
          <UserCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
            Account Settings
          </h2>
          <p className="text-sm sm:text-base text-textMuted mt-1 leading-relaxed">
            Manage your personal information, profile picture, and account security.
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