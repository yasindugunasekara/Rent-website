"use client";

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import { useDashboard } from "@/lib/DashboardContext";

export default function ProfilePage() {
  const { profile, updateProfile } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateProfile(data);
    setIsSubmitting(false);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-[#0B3D2E]">My Profile</h2>
      <ProfileForm
        initialValues={profile}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}
