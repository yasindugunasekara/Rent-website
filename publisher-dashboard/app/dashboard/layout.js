import DashboardNavbar from "@/components/DashboardNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <DashboardNavbar />
      <div className="mx-auto flex w-full max-w-5xl gap-6 p-4 pb-24 md:pb-8">
        
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}
