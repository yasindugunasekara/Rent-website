import Link from "next/link";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h2 className="text-2xl font-semibold text-[#0B3D2E]">Welcome back</h2>
        <p className="mt-2 text-zinc-600">
          Manage your listings, publish new ads, and keep your profile updated.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/create"
          className="rounded-2xl bg-[#0B3D2E] p-5 text-white shadow-md transition hover:bg-[#0f4a37]"
        >
          <p className="text-sm text-white/80">Quick action</p>
          <p className="mt-1 text-lg font-semibold">Create a new ad</p>
        </Link>
        <Link
          href="/dashboard/history"
          className="rounded-2xl bg-white p-5 text-zinc-900 shadow-md transition hover:shadow-lg"
        >
          <p className="text-sm text-zinc-500">Manage items</p>
          <p className="mt-1 text-lg font-semibold text-[#0B3D2E]">View my listings</p>
        </Link>
      </div>
    </section>
  );
}
