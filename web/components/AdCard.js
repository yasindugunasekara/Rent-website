import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { Power, Loader2 } from "lucide-react";

export default function AdCard({ ad, onDeleteClick }) {
  const { toggleAdStatus, formatPrice } = useDashboard();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    setIsToggling(true);
    await toggleAdStatus(ad);
    setIsToggling(false);
  };

  const displayImage = ad.images && ad.images.length > 0 ? ad.images[0].url : "https://placehold.co/600x400?text=No+Image";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg border border-zinc-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGE SECTION */}
      <Link href={`/dashboard/view/${ad.id}`} className="relative w-full aspect-square bg-zinc-50 cursor-pointer overflow-hidden group">
        <Image
          src={displayImage}
          alt={ad.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={true}
        />

        {/* Status Badge */}
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm z-10
          ${ad.available ? "bg-emerald-500/90 text-white ring-1 ring-emerald-400/50" : "bg-zinc-500/90 text-white ring-1 ring-zinc-400/50"}`}
        >
          {ad.available ? "Active" : "Inactive"}
        </div>

        {/* Quick Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          title={ad.available ? "Deactivate Ad" : "Activate Ad"}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-sm transition-all z-10
            ${ad.available ? "bg-emerald-100/90 text-emerald-600 hover:bg-emerald-200" : "bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200"}`}
        >
          {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
        </button>

        {ad.images && ad.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            +{ad.images.length - 1} Photos
          </div>
        )}
      </Link>

      {/* DETAILS & BUTTONS SECTION */}
      <div className="flex flex-col flex-grow p-5">
        <div className="space-y-1.5 mb-5">
          <Link href={`/dashboard/view/${ad.id}`}>
            <h3 className="line-clamp-1 text-lg font-bold text-zinc-900 hover:text-primary transition-colors cursor-pointer">{ad.title}</h3>
          </Link>
          <p className="text-sm font-medium text-zinc-500">{ad.location}</p>
          <p className="text-base font-bold text-primary">{formatPrice(ad.price)}/day</p>
        </div>

        {/* BUTTONS */}
        <div className="mt-auto flex gap-3">
          <Link
            href={`/dashboard/edit/${ad.id}`}
            className="flex-1 rounded-xl bg-[#517E66] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2A5743] active:scale-[0.98]"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDeleteClick(ad)}
            className="flex-1 rounded-xl border-2 border-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:border-red-100 active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
