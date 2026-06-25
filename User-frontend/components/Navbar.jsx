"use client";

import Link from "next/link";
import { Bookmark, Menu, X, PlusCircle, LogIn, UserPlus } from "lucide-react";
import FloatingCurrency from "./FloatingCurrency";
import { useBookmarks } from "../lib/BookmarkContext";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { bookmarks, isHydrated } = useBookmarks();
  const pathname = usePathname();
  const isBookmarksPage = pathname === "/bookmarks";

  return (
    <nav className="bg-[#003B95] text-white sticky top-0 z-[100] shadow-md">
      {/* Top Tier: Utility & Account */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight">
              Open<span className="text-white/90">RentO</span>.com
            </span>
          </Link>

          {/* UTILITY ACTIONS (Desktop) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Currency Selector (Always visible) */}
            <div className="relative group/tooltip">
              <FloatingCurrency />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/tooltip:block z-[110]">
                <div className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap uppercase tracking-wider border border-white/10">
                  Change Currency
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 border-l border-t border-white/10"></div>
              </div>
            </div>

            {/* Language (Desktop) */}
            <div className="relative group/tooltip hidden sm:block">
              <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors">
                <img 
                  src="https://flagcdn.com/us.svg" 
                  alt="English" 
                  className="w-5 h-5 rounded-full object-cover"
                />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/tooltip:block z-[110]">
                <div className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap uppercase tracking-wider border border-white/10">
                  Language: EN
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 border-l border-t border-white/10"></div>
              </div>
            </div>

            {/* Bookmark Icon */}
            <div className="relative group/tooltip">
              <Link 
                href={isBookmarksPage ? "/" : "/bookmarks"}
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors ${
                  isBookmarksPage ? "bg-white/10 text-white" : ""
                }`}
              >
                <Bookmark className={`w-6 h-6 ${isBookmarksPage ? "fill-current" : ""}`} />
                {isHydrated && bookmarks.length > 0 && (
                  <span className="absolute top-1 right-1 bg-[#D4111E] text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border border-white">
                    {bookmarks.length}
                  </span>
                )}
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/tooltip:block z-[110]">
                <div className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap uppercase tracking-wider border border-white/10">
                  {isBookmarksPage ? "Close Bookmarks" : "My Bookmarks"}
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 border-l border-t border-white/10"></div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              <button className="px-4 py-2 border border-white rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
                List your Items
              </button>
              <button className="px-4 py-2 bg-white text-[#003B95] rounded-md text-sm font-bold hover:bg-gray-100 transition-colors">
                Register
              </button>
              <button className="px-4 py-2 bg-white text-[#003B95] rounded-md text-sm font-bold hover:bg-gray-100 transition-colors">
                Sign in
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors ml-1"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#003B95] border-t border-white/10 shadow-xl animate-in slide-in-from-top duration-300 z-50">
          <div className="px-4 py-6 space-y-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left">
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">List your item</span>
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 mt-4">
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#003B95] rounded-xl font-bold hover:bg-gray-100 transition-colors">
                <UserPlus className="w-5 h-5" />
                <span>Register</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#003B95] rounded-xl font-bold hover:bg-gray-100 transition-colors">
                <LogIn className="w-5 h-5" />
                <span>Sign in</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
