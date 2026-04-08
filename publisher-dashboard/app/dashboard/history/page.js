"use client";

import { useState } from "react";
import AdCard from "@/components/AdCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useDashboard } from "@/lib/DashboardContext";

export default function HistoryPage() {
  const { ads, deleteAd } = useDashboard();
  const [selectedAd, setSelectedAd] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!selectedAd) return;
    setDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    deleteAd(selectedAd.id);
    setDeleting(false);
    setSelectedAd(null);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-[#0B3D2E]">My Listings</h2>
        <p className="text-sm text-zinc-600">View, edit, or remove your published ads.</p>
      </div>

      {ads.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <p className="text-zinc-600">No listings yet. Create your first ad.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} onDeleteClick={setSelectedAd} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(selectedAd)}
        title="Delete Listing"
        message="Are you sure you want to delete this ad?"
        onCancel={() => setSelectedAd(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </section>
  );
}
