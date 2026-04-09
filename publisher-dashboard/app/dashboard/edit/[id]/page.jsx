"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AdForm from "@/components/AdForm";
import { useDashboard } from "@/lib/DashboardContext";

export default function EditAdPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { getAdById, updateAd } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ad = getAdById(id);

  if (!ad) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <p className="text-zinc-600">This listing was not found.</p>
        <Link
          href="/dashboard/history"
          className="mt-4 inline-block rounded-xl bg-[#0B3D2E] px-4 py-2 text-sm font-medium text-white"
        >
          Back to listings
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    updateAd(id, data);
    setIsSubmitting(false);
    router.push("/dashboard/history");
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-[#0B3D2E]">Edit Ad</h2>
        <p className="text-sm text-zinc-600">Update your listing details and save changes.</p>
      </div>
      <AdForm
        initialValues={ad}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update Ad"
      />
    </section>
  );
}
