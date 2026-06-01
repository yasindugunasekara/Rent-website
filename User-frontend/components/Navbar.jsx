"use client";

import Link from "next/link";
import { Bookmark, ShoppingBag } from "lucide-react";
import { useBookmarks } from "../lib/BookmarkContext";

export default function Navbar() {
  const { bookmarks, isHydrated } = useBookmarks();

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-200">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter">
            Rent<span className="text-blue-600">Anything</span>
          </span>
        </Link>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <Link 
            href="/bookmarks" 
            className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="My Bookmarks"
          >
            <Bookmark className="w-6 h-6" />
            {isHydrated && bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
                {bookmarks.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
