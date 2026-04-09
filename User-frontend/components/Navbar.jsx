'use client';

import { Search, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">RentIt</h1>
          </div>

         

          <button className="md:hidden p-2 rounded-md text-primary hover:bg-gray-100 transition">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
