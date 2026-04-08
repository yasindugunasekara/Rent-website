"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdForm from "@/components/AdForm";
import { useDashboard } from "@/lib/DashboardContext";

export default function CreateAdPage() {
  const { createAd } = useDashboard();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    createAd(formData);
    setIsSubmitting(false);
    router.push("/dashboard/history");
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-[#0B3D2E]">Create Ad</h2>
        <p className="text-sm text-zinc-600">Publish a new rental item in a few steps.</p>
      </div>
      <AdForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Publish Ad" />
    </section>
  );
}
