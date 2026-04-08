"use client";

import { createContext, useContext, useMemo } from "react";
import { mockUser } from "@/lib/data";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useMemo(
    () => ({
      isAuthenticated: true,
      user: mockUser,
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
