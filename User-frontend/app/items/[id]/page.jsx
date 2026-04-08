"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, X } from "lucide-react";
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
    return <h1 className="text-center mt-10 text-xl">Item Not Found</h1>;
  }

  const images = [
    item.image,
    "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg",
    "https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg",
    "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg",
  ];

  // 🔥 Navigation functions
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  // 🔥 Keyboard support
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
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      {/* 🔙 Back */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow hover:bg-gray-100 transition mb-8"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* 🔥 Layout */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* 🖼 LEFT */}
        <div className="flex gap-4">

          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition
                  ${
                    currentIndex === i
                      ? "border-primary scale-105"
                      : "border-gray-200 hover:border-primary"
                  }`}
              >
                <Image src={img} alt="thumb" fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div
            onClick={() => setShowPreview(true)}
            className="relative flex-1 h-[420px] rounded-xl overflow-hidden bg-white shadow cursor-zoom-in"
          >
            <Image
              src={images[currentIndex]}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>

        </div>

        {/* 📄 RIGHT */}
        <div className="flex flex-col justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {item.title}
            </h1>

            <div className="flex items-center text-gray-500 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              {item.location}
            </div>

            <div className="text-3xl font-bold text-primary mb-6">
              ${item.price}
              <span className="text-lg text-gray-500"> / day</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {item.description ||
                "High quality rental item, reliable and perfect for your needs."}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-lg font-medium transition w-full"
          >
            Rent Now
          </button>
        </div>

      </div>

      {/* 🔥 CONTACT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">
              Contact Owner
            </h2>

            <a
              href={`tel:${item.phone}`}
              className="flex items-center gap-4 p-4 rounded-2xl bg-green-100 hover:bg-green-200 transition mb-4"
            >
              <div className="bg-green-500 text-white p-3 rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Call Now</p>
                <p className="text-sm text-gray-500">{item.phone}</p>
              </div>
            </a>

            <a
              href={item.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-blue-100 hover:bg-blue-200 transition"
            >
              <div className="bg-blue-500 text-white p-3 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">View Location</p>
                <p className="text-sm text-gray-500">Open Google Maps</p>
              </div>
            </a>

          </div>
        </div>
      )}

      {/* 🔥 FULLSCREEN IMAGE PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center">

          {/* Close */}
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-6 right-6 text-white bg-black/50 p-3 rounded-full"
          >
            ✕
          </button>

          {/* Prev */}
          <button
            onClick={prevImage}
            className="absolute left-6 text-white text-4xl bg-black/40 px-4 py-2 rounded-full"
          >
            ‹
          </button>

          {/* Image */}
          <div className="relative w-full max-w-5xl h-[80vh]">
            <Image
              src={images[currentIndex]}
              alt="preview"
              fill
              className="object-contain"
            />
          </div>

          {/* Next */}
          <button
            onClick={nextImage}
            className="absolute right-6 text-white text-4xl bg-black/40 px-4 py-2 rounded-full"
          >
            ›
          </button>

        </div>
      )}
    </div>
  );
}