"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";
import { useTranslation } from "../lib/i18n/LocaleContext";

// Explicitly define custom marker icon to fix Next.js 404 issue
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to dynamically update map center when location changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLocation, initialAddress }) {
  const { t } = useTranslation();
  const [position, setPosition] = useState(
    initialLocation || { lat: 6.9271, lng: 79.8612 } // Default to Colombo
  );
  const [address, setAddress] = useState(initialAddress || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const markerRef = useRef(null);

  // Update parent whenever location changes
  useEffect(() => {
    // Only update parent if we actually have a position AND either an address or it's a new location being picked
    // This prevents overwriting parent address with empty string on initial load if address is already set.
    if (onLocationSelect && position.lat && position.lng) {
      onLocationSelect({
        latitude: position.lat,
        longitude: position.lng,
        address: address,
      });
    }
  }, [position, address, onLocationSelect]);

  // Reverse Geocoding: Lat/Lng -> Readable Address
  const reverseGeocode = async (lat, lng) => {
    try {
      setLoading(true);
      setStatusText(t("locationPicker.fetchingAddress"));
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(t("locationPicker.addressNotFound"));
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setAddress(t("locationPicker.addressFetchError"));
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  // Search Geocoding: Text -> Lat/Lng
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setStatusText(t("locationPicker.searching"));
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPos);
        setAddress(display_name);
      } else {
        alert(t("locationPicker.locationNotFound"));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert(t("locationPicker.geocodingError"));
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // HTML5 Geolocation API
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(t("locationPicker.geolocationUnsupported"));
      return;
    }

    setLoading(true);
    setStatusText(t("locationPicker.detectingLocation"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        reverseGeocode(newPos.lat, newPos.lng);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert(t("locationPicker.geolocationError"));
        setLoading(false);
        setStatusText("");
      }
    );
  };

  // Draggable Marker Event Handlers
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition({ lat: newPos.lat, lng: newPos.lng });
          reverseGeocode(newPos.lat, newPos.lng);
        }
      },
    }),
    []
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Row: Search & My Location */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t("locationPicker.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-24 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-background outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primaryHover text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            {t("locationPicker.search")}
          </button>
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={loading}
          className="group flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-extrabold transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading && statusText === t("locationPicker.detectingLocation") ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          )}
          <span>{t("locationPicker.useMyLocation")}</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[350px] sm:h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm z-0">
        {loading && (
          <div className="absolute inset-0 z-[1000] bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
            <span className="font-semibold text-textMain">{statusText}</span>
          </div>
        )}
        
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[position.lat, position.lng]}
            ref={markerRef}
            icon={customIcon}
          />
          <MapUpdater center={position} />
        </MapContainer>
      </div>

      {/* Info Card: Address Only */}
      <div className="bg-surface border border-gray-100 dark:border-zinc-800 rounded-xl p-4 flex items-start gap-4 text-sm shadow-sm">
        <div className="flex-1">
          <p className="font-bold text-textMain flex items-center gap-1.5 mb-1">
            <MapPin className="w-4 h-4 text-primary" />
            {t("locationPicker.selectedAddress")}
          </p>
          <p className="text-textMuted line-clamp-2 leading-relaxed">
            {address || t("locationPicker.addressHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
