"use client";

import { AuthProvider } from "@/lib/AuthContext";
import { DashboardProvider } from "@/lib/DashboardContext";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

function SessionWatcher({ children }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      // If we're on a dashboard page and session is gone, redirect to login
      if (window.location.pathname.startsWith("/dashboard")) {
        window.location.href = "/login";
      }
    }

    // Auto-logout when session expires
    if (session?.expires) {
      const expires = new Date(session.expires).getTime();
      const now = new Date().getTime();
      const timeUntilExpiry = expires - now;

      if (timeUntilExpiry > 0) {
        const timer = setTimeout(() => {
          signOut({ callbackUrl: "/login" });
        }, timeUntilExpiry);

        return () => clearTimeout(timer);
      } else {
        signOut({ callbackUrl: "/login" });
      }
    }
  }, [session, status]);

  return <>{children}</>;
}

export default function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <SessionWatcher>
        <AuthProvider>
          <DashboardProvider>{children}</DashboardProvider>
        </AuthProvider>
      </SessionWatcher>
    </SessionProvider>
  );
}
