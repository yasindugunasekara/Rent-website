"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import * as api from "@/lib/api-client";

const AuthContext = createContext(null);

// Replaces NextAuth's SessionProvider. There's no client-readable token to
// manage — the session lives in an httpOnly cookie — this just asks the
// server who's signed in via GET /api/auth/session and exposes the result.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"

  const refresh = useCallback(async () => {
    try {
      const { user: sessionUser } = await api.getSession();
      setUser(sessionUser);
      setStatus(sessionUser ? "authenticated" : "unauthenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refresh();
    // Light periodic re-check so a session revoked elsewhere (password
    // change, admin action) is picked up without a full page reload.
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const signOut = useCallback(async (redirectTo = "/login") => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
      if (typeof window !== "undefined") window.location.href = redirectTo;
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, isAuthenticated: status === "authenticated", refresh, signOut }),
    [user, status, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
