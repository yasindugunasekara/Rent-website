"use client";

import Link from "next/link";
import { PlusCircle, List, User, ArrowRight, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 sm:p-8 md:p-12 font-sans relative">
      
      <section className="mx-auto max-w-5xl space-y-6 sm:space-y-8 animate-fadeIn">
        
        {/* WELCOME CARD */}
        <div className="rounded-[2rem] bg-surface p-6 sm:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-textMain tracking-tight mb-2 sm:mb-3">
            Welcome Back 👋
          </h2>
          <p className="text-base sm:text-lg text-textMuted max-w-2xl leading-relaxed">
            Manage your global rentals, publish new items, and keep your business thriving.
          </p>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="grid gap-4 sm:gap-8 sm:grid-cols-2">

          {/* CREATE AD CARD - 🔥 FIXED: MOBILE වලදී HIDE කළා (hidden md:flex) */}
          <Link
            href="/dashboard/create"
            className="hidden md:flex group flex-col justify-between rounded-[2rem] bg-primary p-8 text-white shadow-md transition-all duration-300 ease-out active:scale-[0.98] hover:bg-primaryHover hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold uppercase tracking-wider text-white/80">Quick Action</p>
                <PlusCircle className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-extrabold leading-tight">Create a <br/>New Ad</p>
            </div>

            <div className="mt-8 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
              <span className="text-base font-medium">List an item for rent</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>

          {/* VIEW LISTINGS - ෆෝන් එකේදී මේක විතරක් උඩින්ම පේනවා */}
          <Link
            href="/dashboard/history"
            className="group flex flex-col justify-between rounded-[2rem] bg-surface p-6 sm:p-8 text-textMain shadow-sm border border-gray-100 transition-all duration-300 ease-out active:scale-[0.98] hover:border-gray-200 hover:shadow-lg hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-textMuted">Manage Items</p>
                <List className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold leading-tight">View My <br/>Listings</p>
            </div>

            <div className="mt-6 sm:mt-8 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-sm sm:text-base font-medium text-textMuted group-hover:text-textMain transition-colors">See published ads</span>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background group-hover:bg-primary/10 transition-colors">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </Link>

        </div>

        {/* PROFILE SECTION */}
        <div className="rounded-[2rem] bg-surface p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
          <div className="flex gap-4 items-start sm:items-center">
            <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success flex-shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-textMain">Profile & Trust</h3>
              <p className="mt-1 sm:mt-2 text-textMuted text-sm sm:text-lg max-w-xl leading-relaxed">
                Verified profiles build trust globally.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-background border border-gray-200 px-8 py-3 sm:py-4 text-textMain font-semibold shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98] whitespace-nowrap"
          >
            Update Profile
          </Link>
        </div>

      </section>

      {/* 🔥 FIXED MOBILE ACTION BAR (ONLY ON MOBILE) 🔥 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-gray-200 p-4 z-50 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/dashboard/create"
            className="flex items-center justify-center gap-2 w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
            Publish New Ad
          </Link>
        </div>
      </div>
    </div>
  );
}