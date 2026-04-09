import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      {/* THE FIX: Full-screen fixed background.
        'fixed inset-0' stretches it to all corners of the screen.
        '-z-10' pushes it behind your content, covering the layout's white background.
      */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1A3B2E] via-[#2A5743] to-[#517E66] -z-10" />

      {/* Main Content Wrapper */}
      <div className="p-4 sm:p-8 md:p-12 font-sans selection:bg-[#D4A353] selection:text-white min-h-[calc(100vh-80px)]">
        
        <section className="mx-auto max-w-5xl space-y-8">
          
          {/* WELCOME CARD - Glassmorphism Effect */}
          <div className="rounded-[2rem] bg-white/10 backdrop-blur-md p-8 sm:p-10 shadow-2xl border border-white/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Welcome Back 👋
            </h2>
            <p className="mt-3 text-lg text-white/80 max-w-2xl">
              Manage your high-value rentals, publish new items, and keep your business thriving.
            </p>
          </div>

          {/* QUICK ACTIONS GRID */}
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2">

            {/* CREATE AD - Primary Action */}
            <Link
              href="/dashboard/create"
              className="group flex flex-col justify-between rounded-[2rem] bg-[#D4A353] p-8 text-[#1A3B2E] shadow-xl transition-all duration-300 ease-out 
                         active:scale-[0.97] hover:bg-[#e0b060] hover:shadow-2xl hover:-translate-y-1"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#1A3B2E]/70">Quick Action</p>
                <p className="mt-2 text-3xl font-bold leading-tight">Create a <br/>New Ad</p>
              </div>

              <div className="mt-8 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                <span className="text-base font-medium">List an item for rent</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A3B2E]/10 group-hover:bg-[#1A3B2E]/20 transition-colors">
                  <span className="text-xl">→</span>
                </div>
              </div>
            </Link>

            {/* VIEW LISTINGS - Secondary Action */}
            <Link
              href="/dashboard/history"
              className="group flex flex-col justify-between rounded-[2rem] bg-white p-8 text-[#1A3B2E] shadow-xl transition-all duration-300 ease-out 
                         active:scale-[0.97] hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-gray-400">Manage Items</p>
                <p className="mt-2 text-3xl font-bold leading-tight">View My <br/>Listings</p>
              </div>

              <div className="mt-8 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="text-base font-medium text-gray-600">See published ads</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <span className="text-xl">→</span>
                </div>
              </div>
            </Link>

          </div>

          {/* PROFILE SECTION */}
          <div className="rounded-[2rem] bg-black/20 backdrop-blur-sm p-8 sm:p-10 shadow-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold tracking-tight">Profile & Trust</h3>
              <p className="mt-2 text-white/70 text-base sm:text-lg max-w-xl">
                Verified profiles get rented 3x faster. Keep your details fresh to build trust with your community.
              </p>
            </div>

            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center rounded-full bg-white/20 px-8 py-4 text-white font-semibold shadow-sm backdrop-blur-md
                         hover:bg-white/30 transition-all duration-200 active:scale-[0.97] border border-white/30 whitespace-nowrap"
            >
              Update Profile
            </Link>
          </div>

        </section>
      </div>
    </>
  );
}