"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, X, ChevronLeft, ChevronRight, ShieldCheck, User } from "lucide-react";
import { mockItems } from "../../../data/mockItems";

export default function ItemDetails({ params }) {
  const router = useRouter();

  const { id } = use(params);
  const itemId = Number(id);
  const item = mockItems.find((i) => i.id === itemId);

  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-textMain mb-2">Item Not Found</h1>
          <button onClick={() => router.push('/')} className="text-primary hover:underline">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const images = [
    item.image,
    "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg",
    "https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg",
    "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg",
  ];

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  useEffect(() => {
    const handleKey = (e) => {
      if (!showPreview) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setShowPreview(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showPreview]);

  return (
    // Added pb-28 for mobile to ensure the bottom fixed bar doesn't hide content
    <div className="min-h-screen bg-background pb-28 lg:pb-20">
      
      <div className="bg-surface border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => window.history.length > 1 ? router.back() : router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-textMuted hover:text-textMain font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to search
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* 📄 LEFT COLUMN: Images & Details */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div 
                onClick={() => setShowPreview(true)}
                className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in group border border-gray-200"
              >
                <Image
                  src={images[currentIndex]}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-opacity duration-300">
                    Click to enlarge
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all
                      ${currentIndex === i ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <Image src={img} alt={`thumbnail-${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {item.category || "Rental Item"}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-textMain mb-4 leading-tight">
                {item.title}
              </h1>

              <div className="flex items-center text-textMuted text-lg mb-8">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                {item.location}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-textMain">Description</h2>
                <p className="text-textMuted text-lg leading-relaxed">
                  {item.description || "Experience top-quality service with this reliable rental item. Perfect for your needs, maintained in excellent condition, and ready for immediate use. Contact the owner today to secure your booking."}
                </p>
              </div>
            </div>
          </div>

          {/* 💰 RIGHT COLUMN: Sticky Action Card (DESKTOP ONLY BEHAVIOR) */}
          <div className="lg:col-span-4">
            {/* hidden on small screens because the bottom bar takes over the main action */}
            <div className="bg-surface rounded-3xl p-8 border border-gray-200 shadow-xl sticky top-24 hidden lg:block">
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-textMain">${item.price}</span>
                <span className="text-lg text-textMuted font-medium"> / day</span>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-primary hover:bg-primaryHover text-white text-lg font-bold py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg mb-6"
              >
                Request to Rent
              </button>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 text-textMain">
                  <div className="bg-green-100 p-2 rounded-full text-success">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Secure global platform</span>
                </div>
                <div className="flex items-center gap-4 text-textMain">
                  <div className="bg-blue-100 p-2 rounded-full text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Verified Publisher</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 MOBILE STICKY BOTTOM BAR (Visible only on small screens) */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 p-4 z-40 lg:hidden shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <span className="text-2xl font-extrabold text-textMain">${item.price}</span>
            <span className="text-sm font-medium text-textMuted"> / day</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primaryHover text-white text-base font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-md"
          >
            Rent Now
          </button>
        </div>
      </div>

      {/* 🔥 CONTACT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-textMain/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl p-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-textMuted" />
            </button>

            <h2 className="text-2xl font-bold text-textMain mb-2">Contact Owner</h2>
            <p className="text-textMuted mb-8">Reach out directly to finalize your rental details.</p>

            <div className="space-y-4">
              <a
                href={`tel:${item.phone}`}
                className="flex items-center gap-5 p-5 rounded-2xl bg-background border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="bg-primary/10 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-textMain text-lg">Call Owner</p>
                  <p className="text-textMuted">{item.phone}</p>
                </div>
              </a>

              <a
                href={item.mapUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-5 rounded-2xl bg-background border border-gray-200 hover:border-success hover:shadow-md transition-all group"
              >
                <div className="bg-success/10 text-success p-3 rounded-xl group-hover:bg-success group-hover:text-white transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-textMain text-lg">View Location</p>
                  <p className="text-textMuted">Open in Google Maps</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 FULLSCREEN IMAGE PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-textMain/95 backdrop-blur-md flex items-center justify-center animate-fadeIn">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-3 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 md:left-10 text-white/70 hover:text-white p-4 transition-colors"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <div className="relative w-full max-w-6xl h-[85vh] px-16">
            <Image
              src={images[currentIndex]}
              alt="preview"
              fill
              className="object-contain"
            />
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 md:right-10 text-white/70 hover:text-white p-4 transition-colors"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        </div>
      )}
    </div>
  );
}