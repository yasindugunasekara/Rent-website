"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/lib/data";
import { sanitizePhone, sanitizeText } from "@/lib/sanitize";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const { data: session } = useSession();
  const [ads, setAds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [loading, setLoading] = useState(true);

  // Fetch exchange rate from USD to target currency
  const fetchExchangeRate = async (targetCurrency) => {
    if (targetCurrency === "USD") {
      setExchangeRate(1.0);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/Ads/exchange-rate?to=${targetCurrency}`);
      if (res.ok) {
        const data = await res.json();
        setExchangeRate(data.rate);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  useEffect(() => {
    fetchExchangeRate(currency);
  }, [currency]);

  // Fetch my ads
  const fetchMyAds = async () => {
    if (!session?.accessToken) {
      console.warn("No access token found in session. User might need to re-login.");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/Ads/my-ads`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      } else if (res.status === 401) {
        console.error("401 Unauthorized: Backend rejected the token. Try logging out and back in.");
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile
  const fetchProfile = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/Profile`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          profilePic: data.profilePic || "",
          preferredCurrency: data.preferredCurrency || "USD",
        });
        // Sync global currency with user's preferred currency
        if (data.preferredCurrency) {
          setCurrency(data.preferredCurrency);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchMyAds();
      fetchProfile();
    }
  }, [session]);

  const value = useMemo(
    () => ({
      ads,
      profile,
      loading,
      currency,
      setCurrency: async (newCurrency) => {
        setCurrency(newCurrency);
        // Persist to profile in background if logged in
        if (session?.accessToken && profile) {
          try {
            fetch(`${API_BASE_URL}/Profile`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.accessToken}`,
              },
              body: JSON.stringify({
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                location: profile.location,
                bio: profile.bio,
                profilePic: profile.profilePic,
                preferredCurrency: newCurrency,
              }),
            });
          } catch (error) {
            console.error("Failed to persist currency preference:", error);
          }
        }
      },
      exchangeRate,
      formatPrice: (usdPrice) => {
        const converted = usdPrice * exchangeRate;
        const rounded = Math.round(converted / 10) * 10;
        return `${rounded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
      },
      createAd: async (data) => {
        if (!session?.accessToken) return null;
        try {
          const res = await fetch(`${API_BASE_URL}/Ads`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
              title: sanitizeText(data.title),
              description: sanitizeText(data.description),
              price: Number(data.price),
              location: sanitizeText(data.location),
              latitude: data.latitude,
              longitude: data.longitude,
              category: sanitizeText(data.category),
              contactNumber: sanitizePhone(data.contactNumber),
              available: data.available,
              imageUrls: data.imageUrls,
              currency: currency,
            }),
          });
          if (res.ok) {
            const newAd = await res.json();
            setAds((prev) => [newAd, ...prev]);
            return newAd;
          }
        } catch (error) {
          console.error("Error creating ad:", error);
        }
        return null;
      },
      updateAd: async (id, data) => {
        if (!session?.accessToken) return false;
        try {
          const res = await fetch(`${API_BASE_URL}/Ads/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
              title: sanitizeText(data.title),
              description: sanitizeText(data.description),
              price: Number(data.price),
              location: sanitizeText(data.location),
              latitude: data.latitude,
              longitude: data.longitude,
              category: sanitizeText(data.category),
              contactNumber: sanitizePhone(data.contactNumber),
              available: data.available,
              imageUrls: data.imageUrls,
              currency: currency,
            }),
          });
          if (res.ok) {
            await fetchMyAds();
            return true;
          }
        } catch (error) {
          console.error("Error updating ad:", error);
        }
        return false;
      },
      deleteAd: async (id) => {
        if (!session?.accessToken) return false;
        try {
          const res = await fetch(`${API_BASE_URL}/Ads/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          if (res.ok) {
            setAds((prev) => prev.filter((item) => String(item.id) !== String(id)));
            return true;
          }
        } catch (error) {
          console.error("Error deleting ad:", error);
        }
        return false;
      },
      toggleAdStatus: async (ad) => {
        if (!session?.accessToken) return false;
        const newStatus = !ad.available;
        try {
          const res = await fetch(`${API_BASE_URL}/Ads/${ad.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
              title: ad.title,
              description: ad.description,
              price: ad.price,
              location: ad.location,
              latitude: ad.latitude,
              longitude: ad.longitude,
              category: ad.category,
              contactNumber: ad.contactNumber,
              available: newStatus,
              imageUrls: ad.images.map(img => img.imageUrl),
            }),
          });
          if (res.ok) {
            setAds((prev) => 
              prev.map((item) => 
                String(item.id) === String(ad.id) ? { ...item, available: newStatus } : item
              )
            );
            return true;
          }
        } catch (error) {
          console.error("Error toggling ad status:", error);
        }
        return false;
      },
      updateProfile: async (data) => {
        if (!session?.accessToken) return false;
        
        const names = data.name.split(" ");
        const firstName = names[0] || "";
        const lastName = names.slice(1).join(" ") || "";

        try {
          const res = await fetch(`${API_BASE_URL}/Profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
              firstName: firstName,
              lastName: lastName,
              email: data.email,
              phone: data.phone,
              location: data.location,
              bio: data.bio,
              profilePic: data.profilePic,
              preferredCurrency: data.preferredCurrency,
            }),
          });
          if (res.ok) {
            await fetchProfile();
            return true;
          }
        } catch (error) {
          console.error("Error updating profile:", error);
        }
        return false;
      },
      getAdById: (id) => ads.find((ad) => String(ad.id) === String(id)),
      refreshAds: fetchMyAds,
    }),
    [ads, profile, session, loading, currency, exchangeRate]
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
