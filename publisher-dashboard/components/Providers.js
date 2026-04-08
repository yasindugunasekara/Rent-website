"use client";

import { AuthProvider } from "@/lib/AuthContext";
import { DashboardProvider } from "@/lib/DashboardContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </AuthProvider>
  );
}
