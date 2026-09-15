import "../styles/globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "RentAnything | Global Rental Marketplace",
    template: "%s | RentAnything",
  },
  description:
    "Discover, rent, and list anything you need from people around the world. A secure, fast, and easy global marketplace.",
  keywords: ["rent items", "global marketplace", "peer-to-peer rental", "borrow"],
  openGraph: {
    title: "RentAnything | Global Rental Marketplace",
    description: "Discover, rent, and list anything you need from people around the world.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <LocaleProvider>
          <AuthProvider>
            {/* Global so the shared currency list (see lib/currencies.ts) is
                reachable from the dashboard too, not just the public site. */}
            <CurrencyProvider>{children}</CurrencyProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
