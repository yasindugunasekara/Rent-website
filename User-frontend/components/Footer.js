export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold"></h2>
            <p className="text-gray-300 text-sm mt-1">Find what you need to rent</p>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="hover:text-accent transition-colors">About</a>
            <a href="#" className="hover:text-accent transition-colors">Contact</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-6 pt-6 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
