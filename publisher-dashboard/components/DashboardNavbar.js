"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/create", label: "Create Ad" },
  { href: "/dashboard/history", label: "My Listings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0B3D2E] text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">

          <h1 className="text-base font-semibold md:text-lg">Publisher Dashboard</h1>

          {/* Desktop Menu */}
          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
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

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            {open ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>

        {/* Mobile dropdown menu with animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-[#0B3D2E] ${
            open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col p-4 space-y-2 text-white">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
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
    </>
  );
}