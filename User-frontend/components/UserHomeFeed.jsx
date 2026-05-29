"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Loader2, AlertCircle, ShoppingBag } from "lucide-react";

const UserHomeFeed = ({ search = "" }) => {
  const [ads, setAds] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:5079/api";

  useEffect(() => {
    const initFeed = async () => {
      try {
        setLoading(true);
        
        // 1. IP Geolocation (Frictionless)
        const geoRes = await fetch("https://ipapi.co/json/");
        const geoData = await geoRes.json();
        
        const coords = {
          lat: geoData.latitude,
          lng: geoData.longitude,
          city: geoData.city
        };
        setLocation(coords);

        // 2. Fetch Ads from Backend
        const adsRes = await fetch(
          `${API_BASE_URL}/Ads?lat=${coords.lat}&lng=${coords.lng}&search=${encodeURIComponent(search)}`
        );
        
        if (!adsRes.ok) throw new Error("Failed to fetch ads from server");
        
        const adsData = await adsRes.json();
        setAds(adsData);
        
      } catch (err) {
        console.error("Feed error:", err);
        setError("Could not load nearby rentals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initFeed();
  }, [search]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-10 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
          ))}
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
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Nearby Rentals
          </h2>
          {location && (
            <p className="text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-blue-600" />
              Showing results for {location.city || "your location"}
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
          <h3 className="text-xl font-bold text-gray-900">No rentals nearby yet</h3>
          <p className="text-gray-500 mt-2">Be the first to post an ad in this area!</p>
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
                <img
                  src={ad.images && ad.images.length > 0 ? ad.images[0].imageUrl : "https://placehold.co/600x400?text=No+Image"}
                  alt={ad.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                  <p className="text-blue-600 font-black text-sm">${ad.price}<span className="text-[10px] text-gray-500 font-medium">/day</span></p>
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
        </div>
      )}
    </div>
  );
};

export default UserHomeFeed;
