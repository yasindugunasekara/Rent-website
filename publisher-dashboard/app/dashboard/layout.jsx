import DashboardNavbar from "@/components/DashboardNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-background font-sans">
      
      {/* 🔝 Top Navigation Bar */}
      <DashboardNavbar />
      
      {/* 📦 Main Content Wrapper */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-12">
        
        <main className="w-full animate-fadeIn">
          {children}
        </main>
        
      </div>
    </div>
  );
}