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
    <div className="max-w-4xl mx-auto animate-fadeIn w-full relative">
      
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
          <AdForm 
            formId="create-ad-form" 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            submitLabel="Publish Ad"
            submitIcon={CheckCircle2}
          />
        </div>
        
      </section>

    </div>
  );
}