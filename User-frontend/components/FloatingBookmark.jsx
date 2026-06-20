"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useBookmarks } from "../lib/BookmarkContext";
import { usePathname } from "next/navigation";

export default function FloatingBookmark() {
  const { bookmarks, isHydrated } = useBookmarks();
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <Link 
      href="/bookmarks" 
      className="absolute top-4 right-4 sm:right-6 lg:right-8 z-50 p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
      title="My Bookmarks"
    >
      <Bookmark className="w-6 h-6" />
      {isHydrated && bookmarks.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
          {bookmarks.length}
        </span>
      )}
    </Link>
  );
}
