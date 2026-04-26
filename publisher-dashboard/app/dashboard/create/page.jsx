"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdForm from "@/components/AdForm";
import { useDashboard } from "@/lib/DashboardContext";
import { ArrowLeft, PackagePlus, Loader2, CheckCircle2 } from "lucide-react";

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
    <div className="max-w-4xl mx-auto animate-fadeIn w-full pb-32 relative">
      
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-textMuted hover:text-textMain font-medium transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <section className="bg-surface rounded-[2rem] p-6 sm:p-10 shadow-sm border border-gray-100">
        
        <div className="flex items-start sm:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="bg-primary/10 p-3 sm:p-4 rounded-2xl flex-shrink-0">
            <PackagePlus className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
              Create a New Ad
            </h2>
            <p className="text-sm sm:text-base text-textMuted mt-1 leading-relaxed">
              Provide clear details and high-quality images to attract more renters globally.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <AdForm formId="create-ad-form" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
        
      </section>

      {/* 🔥 STICKY BOTTOM ACTION BAR (ALL SCREENS) 🔥 */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 p-4 sm:p-6 z-50 shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-2 sm:px-0">
          
          <div className="hidden sm:block">
            <p className="text-base font-bold text-textMain">Ready to Publish?</p>
            <p className="text-sm font-medium text-textMuted">Make sure all details are correct.</p>
          </div>
          
          <button
            form="create-ad-form"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover disabled:bg-primary/60 text-white text-lg font-bold px-12 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                Publish Ad
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  );
}