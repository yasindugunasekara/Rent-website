"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PackageSearch, Plus, LayoutGrid, AlertCircle, Loader2 } from "lucide-react";
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
    <div className={`w-full max-w-7xl mx-auto animate-fadeIn transition-all duration-700 ease-out transform ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}>
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight">
              My Listings
            </h2>
          </div>
          <p className="text-base text-textMuted leading-relaxed">
            You have <span className="font-bold text-textMain">{ads.length}</span> active listings. Manage, edit or promote them.
          </p>
        </div>
        
        {/* Quick Create Button (Aligned with our Blue Theme) */}
        {ads.length > 0 && (
          <Link
            href="/dashboard/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primaryHover hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={20} />
            Create New Listing
          </Link>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      {ads.length === 0 ? (
        /* 🚀 MODERN EMPTY STATE */
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-surface border border-gray-100 p-12 sm:p-24 text-center shadow-sm">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative rounded-full bg-background border border-gray-100 p-8">
              <PackageSearch size={64} className="text-gray-300" />
            </div>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-extrabold text-textMain mb-3">Your shop is empty</h3>
          <p className="text-lg text-textMuted max-w-md mx-auto mb-10 leading-relaxed">
            Start earning today by listing your first item. It takes less than 2 minutes!
          </p>
          
          <Link
            href="/dashboard/create"
            className="group flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-xl font-bold text-white shadow-xl shadow-primary/20 transition-all duration-300 hover:bg-primaryHover hover:shadow-2xl hover:-translate-y-1 active:scale-95"
          >
            <Plus size={24} className="transition-transform group-hover:rotate-90" />
            Post Your First Ad
          </Link>
        </div>
      ) : (
        /* 📱 RESPONSIVE GRID FOR LISTINGS */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
          {ads.map((ad) => (
            <div 
              key={ad.id} 
              className="group transition-all duration-300 hover:-translate-y-2"
            >
              <div className="h-full rounded-2xl bg-surface border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                <AdCard ad={ad} onDeleteClick={setSelectedAd} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      <ConfirmModal
        isOpen={Boolean(selectedAd)}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Delete Listing?</span>
          </div>
        }
        message={
          <span className="text-textMuted leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-textMain">"{selectedAd?.title}"</span>? 
            This action is permanent and your listing data will be lost forever.
          </span>
        }
        onCancel={() => setSelectedAd(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}