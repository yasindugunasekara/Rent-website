"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBookmarks } from "@/lib/BookmarkContext";
import { useCurrency } from "@/lib/CurrencyContext";
import { getAdsBatch } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/LocaleContext";
import { Heart, MapPin, Loader2, Bookmark, ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark, isBookmarked, isHydrated } = useBookmarks();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkedAds = async () => {
      if (!isHydrated) return;
      if (bookmarks.length === 0) {
        setAds([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { items } = await getAdsBatch(bookmarks);
        setAds(items);
      } catch (error) {
        console.error("Error fetching bookmarked ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedAds();
  }, [bookmarks, isHydrated]);

  if (!isHydrated || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold">{t("bookmarksPage.loadingFavorites")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-blue-600 fill-current" />
            {t("bookmarksPage.title")}
          </h2>
          <p className="text-gray-500 mt-1 font-medium">{t("bookmarksPage.subtitle")}</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100">
          {t("bookmarksPage.itemsSaved", { count: ads.length })}
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 max-w-2xl mx-auto">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Bookmark className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">{t("bookmarksPage.emptyTitle")}</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">{t("bookmarksPage.emptySubtitle")}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all hover:-translate-y-1 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("bookmarksPage.exploreRentals")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {ads.map((ad, index) => (
            <Link
              key={ad.id}
              href={`/items/${ad.id}`}
              className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Section */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image
                  src={ad.images && ad.images.length > 0 ? ad.images[0].url : "https://placehold.co/600x400?text=No+Image"}
                  alt={ad.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized={true}
                />

                {/* Bookmark Button */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleBookmark(ad.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleBookmark(ad.id);
                    }
                  }}
                  className="absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm z-10 bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  title={t("bookmarksPage.removeFromBookmarks")}
                >
                  <Trash2 className="w-4 h-4" />
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                  <p className="text-blue-600 font-black text-sm">
                    {formatPrice(ad.price)}
                    <span className="text-[10px] text-gray-500 font-medium">{t("homeFeed.perDay")}</span>
                  </p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                    {ad.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">{ad.title}</h3>
                <div className="flex items-center gap-1.5 mt-2 text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className="text-xs font-medium line-clamp-1">{ad.location}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
