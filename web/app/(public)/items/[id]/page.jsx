"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Package,
  BadgeCheck,
  Info,
  Heart,
} from "lucide-react";
import { useBookmarks } from "@/lib/BookmarkContext";
import { useCurrency } from "@/lib/CurrencyContext";
import { getAd, ApiClientError } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LocaleContext";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const [showStickyBar, setShowStickyBar] = useState(true);

  // IntersectionObserver to hide/show sticky bottom bar when footer is in view
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { root: null, threshold: 0 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const fetchAd = async () => {
      if (!ad) setLoading(true);
      try {
        const data = await getAd(id);
        setAd(data);
        setCurrentImageIndex(0);
      } catch (error) {
        if (!(error instanceof ApiClientError && error.status === 404)) {
          console.error("Error fetching ad:", error);
        }
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll to the top of the page when the item page is opened/changed
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] pb-32 lg:pb-20 animate-fadeIn pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                <div className="relative aspect-[4/3] rounded-[2.5rem] bg-gray-200 animate-pulse shadow-sm" />
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse" />
                  <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse" />
                  <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse" />
                </div>
              </div>

              <div className="flex flex-col bg-white rounded-[2rem] p-6 sm:p-10 border border-gray-100/80 shadow-sm space-y-6">
                <div className="flex gap-3">
                  <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
                </div>
                <div className="h-12 w-3/4 bg-gray-200 animate-pulse rounded-xl" />
                <div className="h-10 w-1/3 bg-gray-200 animate-pulse rounded-xl" />
                <div className="border-t border-gray-100 my-4" />
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-200 animate-pulse" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-200 animate-pulse" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 my-4" />
                <div className="space-y-3">
                  <div className="h-6 w-28 bg-gray-200 animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 lg:sticky lg:top-28 lg:h-fit">
              <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-full bg-gray-200 animate-pulse rounded-2xl" />
                </div>
                <div className="space-y-2 pt-4 border-t border-gray-200/50">
                  <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <Info className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">{t("itemDetail.notFoundTitle")}</h3>
        <p className="text-gray-500 mb-8">{t("itemDetail.notFoundSubtitle")}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all"
        >
          {t("itemDetail.backToHome")}
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
    <div className="min-h-screen bg-[#FDFDFF] pb-32 lg:pb-20 animate-fadeIn pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* LEFT COLUMN: Images & Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* IMAGE GALLERY */}
            <div className="space-y-6">
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-xl group">
                {ad.images && ad.images.length > 0 ? (
                  <>
                    <Image
                      src={ad.images[currentImageIndex].url}
                      alt={ad.title}
                      fill
                      className="object-cover transition-transform duration-700"
                      unoptimized={true}
                      priority
                    />

                    {ad.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-900" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-900" />
                        </button>
                      </>
                    )}

                    <div className="absolute top-6 left-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {currentImageIndex + 1} / {ad.images.length}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-16 h-16 text-gray-200" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {ad.images?.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {ad.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${idx === currentImageIndex ? "border-blue-500 scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <Image src={img.url} alt="Thumbnail" fill className="object-cover" unoptimized={true} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ITEM INFO */}
            <div className="flex flex-col bg-white rounded-[2rem] p-6 sm:p-10 border border-gray-100/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-50 text-blue-600 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-blue-100">
                  {ad.category}
                </span>
                {ad.available && (
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100">
                    <BadgeCheck className="w-4 h-4" />
                    {t("itemDetail.available")}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mb-6 gap-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">{ad.title}</h1>
                <button
                  onClick={() => toggleBookmark(ad.id)}
                  className={`p-4 rounded-2xl transition-all duration-300 shadow-sm border shrink-0
                    ${isBookmarked(ad.id) ? "bg-red-500 text-white border-red-500 shadow-red-200" : "bg-white text-gray-400 border-gray-100 hover:text-red-500 hover:border-red-100"}`}
                >
                  <Heart className={`w-6 h-6 ${isBookmarked(ad.id) ? "fill-current" : ""}`} />
                </button>
              </div>

              <div className="flex items-baseline gap-2 mb-10 pb-10 border-b border-gray-100">
                <span className="text-4xl sm:text-5xl font-black text-blue-600">{formatPrice(ad.price)}</span>
                <span className="text-gray-400 font-bold text-xl">{t("itemDetail.perDay")}</span>
              </div>

              <div className="grid gap-6 mb-12 sm:grid-cols-2">
                {ad.latitude != null && ad.longitude != null ? (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${ad.latitude},${ad.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group cursor-pointer"
                  >
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                      <MapPin className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
                        {t("itemDetail.pickupLocation")}
                      </p>
                      <p className="text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{ad.location}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 rounded-2xl">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("itemDetail.pickupLocationPlain")}</p>
                      <p className="text-lg font-bold text-gray-800 leading-tight">{ad.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("itemDetail.postedDate")}</p>
                    <p className="text-lg font-bold text-gray-800">
                      {new Date(ad.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  {t("itemDetail.description")}
                  <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed whitespace-pre-wrap">{ad.description}</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Publisher Card */}
          <div className="lg:col-span-1 lg:sticky lg:top-28 lg:h-fit">
            {ad.publisher && (
              <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">{t("itemDetail.contactPublisher")}</h3>
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                    {ad.publisher.profilePicUrl ? (
                      <Image src={ad.publisher.profilePicUrl} alt="Publisher" fill className="object-cover" unoptimized={true} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-black text-xl uppercase">
                        {ad.publisher.firstName?.[0]}
                        {ad.publisher.lastNameInitial?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 leading-none mb-1">
                      {ad.publisher.firstName} {ad.publisher.lastNameInitial}
                    </p>
                    <p className="text-sm font-bold text-blue-600">{t("itemDetail.verifiedPartner")}</p>
                  </div>
                </div>

                <div className="hidden lg:grid gap-3">
                  <a
                    href={`tel:${ad.contactNumber}`}
                    className="flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 rounded-2xl font-black text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all active:scale-95"
                  >
                    <Phone className="w-5 h-5 text-emerald-500" />
                    {ad.contactNumber}
                  </a>
                </div>

                {ad.publisher.bio && (
                  <div className="mt-8 pt-8 border-t border-gray-200/50">
                    <p className="text-sm text-gray-500 italic">&ldquo;{ad.publisher.bio}&rdquo;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Contact & Directions Bar for Mobile */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] p-4 flex gap-3 lg:hidden transition-all duration-300 transform ${
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {ad.contactNumber && (
          <a
            href={`tel:${ad.contactNumber}`}
            className="flex-1 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span className="truncate">{t("itemDetail.call")}</span>
          </a>
        )}

        {ad.latitude != null && ad.longitude != null && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${ad.latitude},${ad.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <MapPin className="w-4 h-4" />
            <span className="truncate">{t("itemDetail.directions")}</span>
          </a>
        )}
      </div>
    </div>
  );
}
