export default function Footer() {
  return (
    <footer className="bg-[#003B95] text-white py-12 mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-black tracking-tight">
              Open<span className="text-white/80">RentO</span>.com
            </h2>
            <p className="text-blue-100/70 text-sm mt-1.5 font-medium">
              Discover, rent, and list anything you need from people around the world.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-blue-100/90">
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-xs text-blue-100/50 font-medium">
          <p>&copy; {new Date().getFullYear()} OpenRentO.com. All rights reserved. Built with trust and security.</p>
        </div>
      </div>
    </footer>
  );
}
