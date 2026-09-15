"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import * as api from "@/lib/api-client";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [ads, setAds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [currency, setCurrencyState] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [rateStale, setRateStale] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currency === "USD") {
      setExchangeRate(1.0);
      setRateStale(false);
      return;
    }
    api
      .getExchangeRate(currency)
      .then((data) => {
        setExchangeRate(data.rate);
        setRateStale(Boolean(data.stale));
      })
      .catch((error) => console.error("Error fetching exchange rate:", error));
  }, [currency]);

  const fetchMyAds = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { items } = await api.getMyAds();
      setAds(items);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getProfile();
      setProfile({
        name: `${data.firstName} ${data.lastName}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        profilePic: data.profilePicUrl || "",
        preferredCurrency: data.preferredCurrency || "USD",
      });
      if (data.preferredCurrency) setCurrencyState(data.preferredCurrency);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyAds();
      fetchProfile();
    } else if (isAuthenticated === false) {
      setLoading(false);
    }
  }, [isAuthenticated, fetchMyAds, fetchProfile]);

  const value = useMemo(
    () => ({
      ads,
      profile,
      loading,
      currency,
      setCurrency: async (newCurrency) => {
        setCurrencyState(newCurrency);
        // Persist to profile in background if logged in
        if (isAuthenticated) {
          api.updateProfile({ preferredCurrency: newCurrency }).catch((error) => {
            console.error("Failed to persist currency preference:", error);
          });
        }
      },
      exchangeRate,
      rateStale,
      formatPrice: (usdPrice) => {
        const converted = usdPrice * exchangeRate;
        const rounded = Math.round(converted / 10) * 10;
        return `${rounded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
      },
      createAd: async (data) => {
        try {
          const newAd = await api.createAd({
            title: sanitizeText(data.title),
            description: sanitizeText(data.description),
            price: Number(data.price),
            location: sanitizeText(data.location),
            latitude: data.latitude ?? undefined,
            longitude: data.longitude ?? undefined,
            category: sanitizeText(data.category),
            contactNumber: sanitizePhone(data.contactNumber),
            available: data.available,
            images: data.images,
            currency,
          });
          setAds((prev) => [newAd, ...prev]);
          return newAd;
        } catch (error) {
          console.error("Error creating ad:", error);
          return null;
        }
      },
      updateAd: async (id, data) => {
        try {
          await api.updateAd(id, {
            title: sanitizeText(data.title),
            description: sanitizeText(data.description),
            price: Number(data.price),
            location: sanitizeText(data.location),
            latitude: data.latitude ?? undefined,
            longitude: data.longitude ?? undefined,
            category: sanitizeText(data.category),
            contactNumber: sanitizePhone(data.contactNumber),
            available: data.available,
            images: data.images,
            currency,
          });
          await fetchMyAds();
          return true;
        } catch (error) {
          console.error("Error updating ad:", error);
          return false;
        }
      },
      deleteAd: async (id) => {
        try {
          await api.deleteAd(id);
          setAds((prev) => prev.filter((item) => String(item.id) !== String(id)));
          return true;
        } catch (error) {
          console.error("Error deleting ad:", error);
          return false;
        }
      },
      toggleAdStatus: async (ad) => {
        const newStatus = !ad.available;
        try {
          await api.setAdAvailability(ad.id, newStatus);
          setAds((prev) =>
            prev.map((item) => (String(item.id) === String(ad.id) ? { ...item, available: newStatus } : item)),
          );
          return true;
        } catch (error) {
          console.error("Error toggling ad status:", error);
          return false;
        }
      },
      updateProfile: async (data) => {
        const names = data.name.trim().split(" ");
        const firstName = names[0] || "";
        const lastName = names.slice(1).join(" ") || "";

        try {
          await api.updateProfile({
            firstName,
            lastName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            bio: data.bio,
            profilePicUrl: data.profilePic,
            preferredCurrency: data.preferredCurrency,
          });

          if (data.newPassword) {
            await api.changePassword({
              currentPassword: data.currentPassword,
              newPassword: data.newPassword,
            });
          }

          await fetchProfile();
          return true;
        } catch (error) {
          console.error("Error updating profile:", error);
          throw error;
        }
      },
      getAdById: (id) => ads.find((ad) => String(ad.id) === String(id)),
      refreshAds: fetchMyAds,
    }),
    [ads, profile, loading, currency, exchangeRate, rateStale, isAuthenticated, fetchMyAds, fetchProfile],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}

// Kept so `user` (id/email/role from the session) is reachable alongside the
// richer `profile` object without every consumer importing useAuth too.
export function useDashboardUser() {
  return useAuth().user;
}
