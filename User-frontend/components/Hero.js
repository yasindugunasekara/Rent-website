'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export default function Hero({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary via-secondary to-primary py-44 px-11">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Find What You Need to Rent
        </h1>
        <p className="text-lg md:text-xl text-gray-100 mb-8">
          Discover thousands of items available for rent in your area
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pl-14 text-lg rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          </div>
        </form>

        <button
          onClick={() => {
            const filterSection = document.getElementById('items');
            filterSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-accent hover:bg-highlight text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Explore Now
        </button>
      </div>
    </section>
  );
}
