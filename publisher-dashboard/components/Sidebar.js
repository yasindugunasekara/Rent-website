"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/create", label: "Create Ad" },
  { href: "/dashboard/history", label: "My Listings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-24 hidden h-fit w-56 rounded-2xl bg-white p-3 shadow-md lg:block">
      <p className="px-3 pb-2 text-sm font-semibold text-zinc-600">Navigation</p>
      <div className="space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-[#0B3D2E] text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-[#0B3D2E]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
