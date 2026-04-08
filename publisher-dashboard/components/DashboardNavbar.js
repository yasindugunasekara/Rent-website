"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/create", label: "Create Ad" },
  { href: "/dashboard/history", label: "My Listings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0B3D2E] text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <h1 className="text-base font-semibold md:text-lg">Publisher Dashboard</h1>
          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2 text-sm transition ${
                    active ? "bg-[#5C8A64]" : "hover:bg-[#5C8A64]/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-3">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-3 text-center text-sm font-medium transition ${
                  active ? "text-[#0B3D2E]" : "text-zinc-500"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
