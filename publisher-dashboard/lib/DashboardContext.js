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
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (session) {
      fetchMyAds();
      setProfile(session.user);
    }
  }, [session]);

  const value = useMemo(
    () => ({
      ads,
      profile,
      loading,
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
              category: sanitizeText(data.category),
              contactNumber: sanitizePhone(data.contactNumber),
              imageUrls: data.imageUrls,
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
              category: sanitizeText(data.category),
              contactNumber: sanitizePhone(data.contactNumber),
              imageUrls: data.imageUrls,
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
            setAds((prev) => prev.filter((item) => item.id === id ? false : true));
            return true;
          }
        } catch (error) {
          console.error("Error deleting ad:", error);
        }
        return false;
      },
      updateProfile: (data) => {
        // Implement profile update if needed
      },
      getAdById: (id) => ads.find((ad) => String(ad.id) === String(id)),
      refreshAds: fetchMyAds,
    }),
    [ads, profile, session, loading]
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
