"use client";

import { AuthProvider } from "@/lib/AuthContext";
import { DashboardProvider } from "@/lib/DashboardContext";

// Replaces next-auth's SessionProvider — session state now comes from
// GET /api/auth/session (an httpOnly cookie, not a client-readable JWT), and
// expiry/revocation is enforced server-side rather than by a client-side
// setTimeout racing the token's exp claim.
export default function DashboardProviders({ children }) {
  return (
    <AuthProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </AuthProvider>
  );
}
