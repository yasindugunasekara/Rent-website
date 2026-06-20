"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBookmarks } from "../../lib/BookmarkContext";
import { useCurrency } from "../../lib/CurrencyContext";
import { Heart, MapPin, Loader2, Bookmark, ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark, isBookmarked, isHydrated } = useBookmarks();
  const { formatPrice } = useCurrency();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:5079/api";

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
        const ids = bookmarks.join(",");
        const res = await fetch(`${API_BASE_URL}/Ads/batch?ids=${ids}`);
        
        if (res.ok) {
          const activeAds = await res.json();
          setAds(activeAds);
        }
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
        <p className="text-gray-400 font-bold">Loading your favorites...</p>
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
            My Bookmarks
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Saved rentals you're interested in
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100">
          {ads.length} items saved
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 max-w-2xl mx-auto">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Bookmark className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No bookmarks yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Items you bookmark will appear here for quick access later.</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all hover:-translate-y-1 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Explore Rentals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {ads.map((ad, index) => (
            <div 
              key={ad.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Section */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image
                  src={ad.images && ad.images.length > 0 ? ad.images[0].imageUrl : "https://placehold.co/600x400?text=No+Image"}
                  alt={ad.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized={true}
                />

                {/* Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleBookmark(ad.id);
                  }}
                  className="absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm z-10 bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  title="Remove from Bookmarks"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                  <p className="text-blue-600 font-black text-sm">{formatPrice(ad.price)}<span className="text-[10px] text-gray-500 font-medium">/day</span></p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                    {ad.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {ad.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className="text-xs font-medium line-clamp-1">{ad.location}</p>
                </div>
                
                <Link 
                  href={`/items/${ad.id}`}
                  className="w-full mt-6 bg-gray-50 text-gray-900 py-3 rounded-xl font-bold text-sm transition-all hover:bg-blue-600 hover:text-white group-hover:shadow-lg active:scale-95 flex items-center justify-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
