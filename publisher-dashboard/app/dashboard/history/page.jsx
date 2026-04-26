"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PackageSearch, Plus } from "lucide-react";
import AdCard from "@/components/AdCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useDashboard } from "@/lib/DashboardContext";

export default function HistoryPage() {
  const { ads, deleteAd } = useDashboard();
  const [selectedAd, setSelectedAd] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedAd) return;
    setDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    deleteAd(selectedAd.id);
    setDeleting(false);
    setSelectedAd(null);
  };

  return (
    <>
      {/* LIGHT THEME BACKGROUND: A very soft off-white/zinc color */}
      <div className="fixed inset-0 bg-zinc-50 -z-10" />

      <section 
        className={`p-4 sm:p-8 md:p-12 min-h-screen space-y-8 transition-all duration-700 ease-out transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              My Listings
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-500">
              View, edit, or remove your published rental ads.
            </p>
          </div>
          
          {/* Quick Create Button (Light theme styling) */}
          {ads.length > 0 && (
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm border border-zinc-200 transition-all hover:bg-zinc-50 hover:border-zinc-300 hover:scale-105 active:scale-95"
            >
              <Plus size={18} />
              New Ad
            </Link>
          )}
        </div>

        {/* CONTENT AREA */}
        {ads.length === 0 ? (
          /* LIGHT THEME EMPTY STATE */
          <div className="flex flex-col items-center justify-center rounded-[2rem] bg-white border border-zinc-100 p-12 sm:p-20 text-center shadow-xl transition-all duration-500 hover:shadow-2xl">
            <div className="mb-6 rounded-full bg-zinc-50 border border-zinc-100 p-6 shadow-inner">
              <PackageSearch size={48} className="text-zinc-300" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-zinc-900">No listings found</h3>
            <p className="mb-8 max-w-md text-zinc-500">
              You haven't published any items for rent yet. Create your first ad to start earning!
            </p>
            <Link
              href="/dashboard/create"
              className="group flex items-center gap-2 rounded-full bg-[#D4A353] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#e0b060] hover:shadow-xl hover:-translate-y-1 active:scale-95"
            >
              <Plus size={24} className="transition-transform group-hover:rotate-90" />
              Create Your First Ad
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ads.map((ad) => (
              <div 
                key={ad.id} 
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl bg-white border border-zinc-100 overflow-hidden"
              >
                <AdCard ad={ad} onDeleteClick={setSelectedAd} />
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        <ConfirmModal
          isOpen={Boolean(selectedAd)}
          title="Delete Listing"
          message="Are you sure you want to permanently delete this ad? This action cannot be undone."
          onCancel={() => setSelectedAd(null)}
          onConfirm={handleConfirmDelete}
          loading={deleting}
        />
      </section>
    </>
  );
}