"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const API_BASE_URL = "http://localhost:5079/api";

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("rent_bookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
        setBookmarks([]);
      }
    }
    setIsHydrated(true);
  }, []);

  // Sync with backend to keep only active ads
  useEffect(() => {
    const syncActiveAds = async () => {
      if (!isHydrated || bookmarks.length === 0) return;

      try {
        const ids = bookmarks.join(",");
        const res = await fetch(`${API_BASE_URL}/Ads/batch?ids=${ids}`);
        if (res.ok) {
          const activeAds = await res.json();
          const activeIds = activeAds.map(ad => ad.id);
          
          // If the list of active IDs is different from our current list, update it
          // This automatically removes inactive or deleted ads
          if (activeIds.length !== bookmarks.length) {
            setBookmarks(activeIds);
          }
        }
      } catch (err) {
        console.error("Failed to sync active bookmarks", err);
      }
    };

    syncActiveAds();
    
    // Optional: Sync periodically (every 5 minutes)
    const interval = setInterval(syncActiveAds, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isHydrated, bookmarks.length]);

  // Save to localStorage whenever bookmarks change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("rent_bookmarks", JSON.stringify(bookmarks));
    }
  }, [bookmarks, isHydrated]);

  const toggleBookmark = (id) => {
    setBookmarks((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isBookmarked = (id) => bookmarks.includes(id);

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked, isHydrated }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
