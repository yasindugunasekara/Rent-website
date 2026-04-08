"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { mockAds, mockUser } from "@/lib/data";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";

const DashboardContext = createContext(null);

function normalizeAdInput(input) {
  return {
    title: sanitizeText(input.title),
    description: sanitizeText(input.description),
    location: sanitizeText(input.location),
    category: sanitizeText(input.category),
    contactNumber: sanitizePhone(input.contactNumber),
    image: input.image || "",
    available: Boolean(input.available),
    price: Number(input.price || 0),
  };
}

export function DashboardProvider({ children }) {
  const [ads, setAds] = useState(mockAds);
  const [profile, setProfile] = useState(mockUser);

  const value = useMemo(
    () => ({
      ads,
      profile,
      createAd: (data) => {
        const ad = normalizeAdInput(data);
        const newAd = {
          ...ad,
          id: `ad-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setAds((prev) => [newAd, ...prev]);
        return newAd;
      },
      updateAd: (id, data) => {
        const ad = normalizeAdInput(data);
        setAds((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, ...ad, updatedAt: new Date().toISOString() } : item
          )
        );
      },
      deleteAd: (id) => {
        setAds((prev) => prev.filter((item) => item.id !== id));
      },
      updateProfile: (data) => {
        const safeProfile = {
          name: sanitizeText(data.name),
          email: sanitizeText(data.email),
          phone: sanitizePhone(data.phone),
          location: sanitizeText(data.location),
        };
        setProfile((prev) => ({ ...prev, ...safeProfile }));
      },
      getAdById: (id) => ads.find((ad) => ad.id === id),
    }),
    [ads, profile]
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }

  return context;
}
