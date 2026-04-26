"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
// react-icons වෙනුවට අපේ app එකේ අනිත් තැන්වල පාවිච්චි කරන lucide-react icons ගත්තා
import { Menu, X, LayoutDashboard, PlusCircle, List, User } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/create", label: "Create Ad", icon: PlusCircle },
  { href: "/dashboard/history", label: "My Listings", icon: List },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Modern Glassmorphism Header: bg-surface/80 (80% opacity) and backdrop-blur-md */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-gray-100 transition-all duration-200">
        
        {/* Changed max-w-5xl to max-w-7xl and added responsive padding to match the Layout */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Brand / Logo Area */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="bg-primary text-white p-1.5 rounded-lg group-hover:bg-primaryHover transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-extrabold text-textMain tracking-tight">
              Rent<span className="text-primary">Anything</span>
            </h1>
            <span className="hidden sm:inline-block text-xs font-bold text-textMuted border-l border-gray-300 pl-2 ml-1 uppercase tracking-wider">
              Publisher
            </span>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active 
                      ? "bg-primary/10 text-primary" 
                      : "text-textMuted hover:bg-gray-50 hover:text-textMain"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-textMuted"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* --- MOBILE MENU BUTTON --- */}
          <button 
            onClick={() => setOpen(!open)} 
            className="md:hidden p-2 rounded-lg text-textMuted hover:bg-gray-100 hover:text-textMain transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Toggle Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* --- MOBILE DROPDOWN MENU --- */}
        <div
          className={`md:hidden absolute w-full overflow-hidden transition-all duration-300 ease-in-out bg-surface border-gray-100 ${
            open ? "max-h-72 border-b shadow-lg opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col p-4 space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                    active 
                      ? "bg-primary/10 text-primary" 
                      : "text-textMuted hover:bg-gray-50 hover:text-textMain"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-textMuted"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Overlay to blur the background when mobile menu is open */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}