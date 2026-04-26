"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdForm from "@/components/AdForm";
import { useDashboard } from "@/lib/DashboardContext";
// Modern UI icons
import { ArrowLeft, Edit3, Loader2, Save, AlertCircle } from "lucide-react";

export default function EditAdPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { getAdById, updateAd } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ad = getAdById(id);

  // --- 404 STATE (Item එක නැතිනම්) ---
  if (!ad) {
    return (
      <div className="max-w-xl mx-auto mt-20 animate-fadeIn text-center">
        <div className="bg-surface rounded-[2.5rem] p-12 shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-textMain mb-2">Listing Not Found</h3>
          <p className="text-textMuted mb-8">
            The ad you're trying to edit doesn't exist or may have been deleted.
          </p>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-white font-bold shadow-md hover:bg-primaryHover transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to My Listings
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 600));
    updateAd(id, data);
    setIsSubmitting(false);
    router.push("/dashboard/history");
  };

  return (
    // pb-32 for sticky button clearance
    <div className="max-w-4xl mx-auto animate-fadeIn w-full pb-32 relative">
      
      {/* 🔙 Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-textMuted hover:text-textMain font-medium transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* 📝 EDIT FORM CARD */}
      <section className="bg-surface rounded-[2rem] p-6 sm:p-10 shadow-sm border border-gray-100">
        
        <div className="flex items-start sm:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="bg-primary/10 p-3 sm:p-4 rounded-2xl flex-shrink-0">
            <Edit3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
              Edit Your Listing
            </h2>
            <p className="text-sm sm:text-base text-textMuted mt-1 leading-relaxed">
              Updating your details or price can help you rent out your item faster.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <AdForm
            formId="edit-ad-form" // Link to the sticky button below
            initialValues={ad}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </section>

      {/* 🔥 STICKY BOTTOM ACTION BAR (FOR UPDATING) 🔥 */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 p-4 sm:p-6 z-50 shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-2 sm:px-0">
          
          <div className="hidden sm:block">
            <p className="text-base font-bold text-textMain">Unsaved Changes</p>
            <p className="text-sm font-medium text-textMuted">Carefully review your updates.</p>
          </div>
          
          <button
            form="edit-ad-form" // Triggers the AdForm
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover disabled:bg-primary/60 text-white text-lg font-bold px-12 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Update Listing
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  );
}