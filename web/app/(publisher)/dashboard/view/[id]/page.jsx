"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Package,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import { useDashboard } from "@/lib/DashboardContext";
import { useTranslation } from "@/lib/i18n/LocaleContext";

export default function AdViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getAdById, formatPrice, loading: dashboardLoading } = useDashboard();
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ads are owner-scoped (available or not) and live in DashboardContext's
  // cache, populated from GET /api/ads/mine. There's no separate fetch here
  // — the public GET /api/ads/[id] endpoint deliberately excludes
  // unavailable ads, so it can't stand in as a fallback for the owner's own
  // view of a deactivated listing.
  const ad = getAdById(id);

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <Package className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium">{t("dashboardView.loadingDetails")}</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-textMain">{t("dashboardView.notFound")}</h3>
        <button onClick={() => router.back()} className="mt-4 text-primary font-bold">
          {t("dashboardView.goBack")}
        </button>
      </div>
    );
  }

  const nextImage = () => {
    if (ad.images && ad.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
    }
  };

  const prevImage = () => {
    if (ad.images && ad.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-textMuted hover:text-textMain font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("dashboardView.backToListings")}
        </button>

        <Link
          href={`/dashboard/edit/${ad.id}`}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-bold hover:bg-primary/20 transition-all"
        >
          <Edit3 className="w-4 h-4" />
          {t("dashboardView.editListing")}
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* IMAGE GALLERY SECTION */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-100 shadow-sm group">
            {ad.images && ad.images.length > 0 ? (
              <>
                <Image src={ad.images[currentImageIndex].url} alt={ad.title} fill className="object-contain" unoptimized />

                {ad.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {ad.images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {ad.images?.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentImageIndex ? "border-primary" : "border-transparent opacity-60"}`}
              >
                <Image src={img.url} alt="Thumbnail" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {ad.category}
            </span>
            {ad.available ? (
              <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                {t("dashboardView.availableNow")}
              </span>
            ) : (
              <span className="bg-zinc-100 text-zinc-500 text-xs font-bold px-3 py-1 rounded-full">{t("dashboardView.inactive")}</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain leading-tight mb-4">{ad.title}</h1>

          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-black text-primary">{formatPrice(ad.price)}</span>
            <span className="text-textMuted font-medium">{t("dashboardView.perDay")}</span>
          </div>

          <div className="bg-surface rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl">
                <MapPin className="w-5 h-5 text-textMuted" />
              </div>
              <div>
                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{t("dashboardView.location")}</p>
                <p className="text-base font-bold text-textMain">{ad.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl">
                <Phone className="w-5 h-5 text-textMuted" />
              </div>
              <div>
                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{t("dashboardView.contactPublisher")}</p>
                <p className="text-base font-bold text-textMain">{ad.contactNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl">
                <Calendar className="w-5 h-5 text-textMuted" />
              </div>
              <div>
                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">{t("dashboardView.postedOn")}</p>
                <p className="text-base font-bold text-textMain">
                  {new Date(ad.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-textMain">{t("dashboardView.description")}</h3>
            <p className="text-textMuted leading-relaxed whitespace-pre-wrap">{ad.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
