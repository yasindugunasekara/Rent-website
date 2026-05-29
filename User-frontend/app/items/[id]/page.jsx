"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  Phone, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Package,
  BadgeCheck,
  User,
  Mail,
  Info
} from "lucide-react";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const API_BASE_URL = "http://localhost:5079/api";

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Ads/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAd(data);
        }
      } catch (error) {
        console.error("Error fetching ad:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-400 font-bold tracking-tight">Loading premium rental...</p>
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
        <h3 className="text-2xl font-black text-gray-900 mb-2">Listing not found</h3>
        <p className="text-gray-500 mb-8">The item you're looking for might have been removed.</p>
        <button 
          onClick={() => router.push("/")}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all"
        >
          Back to Home
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
    <div className="min-h-screen bg-[#FDFDFF] pb-20 animate-fadeIn">
      
      {/* 🔝 NAV BAR (Minimal) */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors"
          >
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          
          {/* 📸 IMAGE GALLERY */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-xl group">
              {ad.images && ad.images.length > 0 ? (
                <>
                  <img
                    src={ad.images[currentImageIndex].imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover transition-transform duration-700"
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
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${idx === currentImageIndex ? 'border-blue-500 scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ℹ️ ITEM INFO */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-50 text-blue-600 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-blue-100">
                {ad.category}
              </span>
              {ad.available && (
                <span className="bg-emerald-50 text-emerald-600 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100">
                  <BadgeCheck className="w-4 h-4" />
                  Available
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
              {ad.title}
            </h1>

            <div className="flex items-baseline gap-2 mb-10 pb-10 border-b border-gray-100">
              <span className="text-5xl font-black text-blue-600">${ad.price}</span>
              <span className="text-gray-400 font-bold text-xl">/ day</span>
            </div>

            <div className="grid gap-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <MapPin className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pick up Location</p>
                  <p className="text-lg font-bold text-gray-800 leading-tight">{ad.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Posted Date</p>
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(ad.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                Description
                <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed whitespace-pre-wrap">
                {ad.description}
              </p>
            </div>

            {/* 👤 PUBLISHER CARD */}
            {ad.publisher && (
              <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Contact Publisher</h3>
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                    {ad.publisher.profilePic ? (
                      <img src={ad.publisher.profilePic} alt="Publisher" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-black text-xl uppercase">
                        {ad.publisher.firstName[0]}{ad.publisher.lastName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 leading-none mb-1">
                      {ad.publisher.firstName} {ad.publisher.lastName}
                    </p>
                    <p className="text-sm font-bold text-blue-600">Verified Rental Partner</p>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  <a 
                    href={`tel:${ad.publisher.phone || ad.contactNumber}`}
                    className="flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 rounded-2xl font-black text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all active:scale-95"
                  >
                    <Phone className="w-5 h-5 text-emerald-500" />
                    {ad.publisher.phone || ad.contactNumber}
                  </a>
                  <a 
                    href={`mailto:${ad.publisher.email}`}
                    className="flex items-center justify-center gap-3 bg-gray-900 py-4 rounded-2xl font-black text-white shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all active:scale-95"
                  >
                    <Mail className="w-5 h-5 text-blue-400" />
                    Email Publisher
                  </a>
                </div>

                {ad.publisher.bio && (
                  <div className="mt-8 pt-8 border-t border-gray-200/50">
                    <p className="text-sm text-gray-500 italic">"{ad.publisher.bio}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
