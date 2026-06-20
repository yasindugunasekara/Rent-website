"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MapPin, Loader2, AlertCircle, ShoppingBag, Heart } from "lucide-react";
import { useBookmarks } from "../lib/BookmarkContext";
import { useCurrency } from "../lib/CurrencyContext";
import FilterBar from "./FilterBar";

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
    <div className="p-5 space-y-4">
      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex justify-between pt-2">
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const UserHomeFeed = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Extract filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    priceRange: searchParams.get('priceRange') || '',
  };

  const [ads, setAds] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { formatPrice, currency } = useCurrency();
  const observer = useRef();
  const API_BASE_URL = "http://localhost:5079/api";

  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([name, value]) => {
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
    });

    // Scroll to results when filters are applied
    router.push(`${pathname}?${params.toString()}#items`, { scroll: false });
  };

  // Intersection Observer for Infinite Scrolling
  const lastAdElementRef = useCallback(node => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, isFetchingMore, hasMore]);

  // Fetch Logic
  const fetchAds = async (coords, currentFilters, pageNumber, isInitial = false) => {
    try {
      // Parse priceRange
      let minPrice = '';
      let maxPrice = '';
      if (currentFilters.priceRange) {
        if (currentFilters.priceRange.includes('-')) {
          [minPrice, maxPrice] = currentFilters.priceRange.split('-');
        } else if (currentFilters.priceRange.endsWith('+')) {
          minPrice = currentFilters.priceRange.replace('+', '');
        }
      }

      const queryParams = new URLSearchParams({
        lat: coords.lat || 0,
        lng: coords.lng || 0,
        search: currentFilters.search,
        category: currentFilters.category,
        locationFilter: currentFilters.location,
        minPrice,
        maxPrice,
        currency,
        page: pageNumber,
        limit: 20
      });

      const adsRes = await fetch(
        `${API_BASE_URL}/Ads?${queryParams.toString()}`,
        { next: { revalidate: 60 } }
      );
      
      if (!adsRes.ok) throw new Error("Failed to fetch ads from server");
      
      const adsData = await adsRes.json();
      
      if (isInitial) {
        setAds(adsData);
      } else {
        setAds(prev => [...prev, ...adsData]);
      }
      
      setHasMore(adsData.length === 20);
    } catch (err) {
      console.error("Fetch error:", err);
      if (isInitial) setError("Could not load nearby rentals. Please try again later.");
    } finally {
      if (isInitial) setLoading(false);
      else setIsFetchingMore(false);
    }
  };

  // Initialize and handle Filter/Search changes
  useEffect(() => {
    const initFeed = async () => {
      try {
        setLoading(true);
        setPage(1);
        setHasMore(true);
        
        let coords = userCoords;

        if (!coords) {
          // Try Browser Geolocation
          const getBrowserLocation = () => {
            return new Promise((resolve) => {
              if (!navigator.geolocation) {
                resolve(null);
                return;
              }
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: "high"
                  });
                },
                () => resolve(null),
                { timeout: 5000, enableHighAccuracy: true }
              );
            });
          };

          const browserCoords = await getBrowserLocation();

          if (browserCoords) {
            coords = browserCoords;
            try {
              const reverseGeoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`);
              const reverseGeoData = await reverseGeoRes.json();
              coords.city = reverseGeoData.city || reverseGeoData.locality || "your exact location";
            } catch (e) {
              coords.city = "your exact location";
            }
          } else {
            // IP Fallback
            try {
              const geoRes = await fetch("https://ipapi.co/json/");
              const geoData = await geoRes.json();
              coords = {
                lat: geoData.latitude,
                lng: geoData.longitude,
                city: geoData.city
              };
            } catch (ipErr) {
              coords = { lat: 0, lng: 0, city: "Worldwide" };
            }
          }
          setUserCoords(coords);
        }

        // Fetch first page with current filters
        await fetchAds(coords, filters, 1, true);
        
      } catch (err) {
        setError("Something went wrong. Please refresh.");
        setLoading(false);
      }
    };

    initFeed();
  }, [searchParams, currency]); // Re-fetch on URL changes or currency change

  // Fetch more when page changes
  useEffect(() => {
    if (page > 1 && userCoords) {
      setIsFetchingMore(true);
      fetchAds(userCoords, filters, page, false);
    }
  }, [page]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-500 max-w-sm mx-auto">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      
      {/* Filters Section */}
      <FilterBar filters={filters} onApplyFilters={handleApplyFilters} />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {filters.search ? `Search results for "${filters.search}"` : "Explore Rentals"}
          </h2>
          {userCoords && (
            <p className="text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-blue-600" />
              Showing results for {userCoords.city || "your location"}
            </p>
          )}
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100">
          {ads.length} items found
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No rentals found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {ads.map((ad, index) => (
            <div 
              key={ad.id}
              ref={index === ads.length - 1 ? lastAdElementRef : null}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
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
                  className={`absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm z-10
                    ${isBookmarked(ad.id) 
                      ? "bg-red-500 text-white" 
                      : "bg-white/80 text-gray-400 hover:text-red-500"}`}
                >
                  <Heart className={`w-4 h-4 ${isBookmarked(ad.id) ? "fill-current" : ""}`} />
                </button>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                  <p className="text-blue-600 font-black text-sm">{formatPrice(ad.price)}<span className="text-[10px] text-gray-500 font-medium">/day</span></p>
                </div>
                
                {/* Distance Badge */}
                {ad.distance !== null && (
                  <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    {ad.distance < 1 ? "Less than 1 km" : `${ad.distance.toFixed(1)} km away`}
                  </div>
                )}
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
                <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                  {ad.description}
                </p>
                
                <Link 
                  href={`/items/${ad.id}`}
                  className="w-full mt-6 bg-gray-50 text-gray-900 py-3 rounded-xl font-bold text-sm transition-all hover:bg-blue-600 hover:text-white group-hover:shadow-lg active:scale-95 flex items-center justify-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
          {isFetchingMore && [...Array(4)].map((_, i) => <SkeletonCard key={`more-${i}`} />)}
        </div>
      )}
    </div>
  );
};

export default UserHomeFeed;