'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export default function Hero({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle the search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Only trigger search if the input is not empty (prevents useless API calls)
    if (onSearch && searchTerm.trim() !== '') {
      onSearch(searchTerm);
    }
  };

  // Smooth scroll to the items section
  const scrollToItems = () => {
    const filterSection = document.getElementById('items');
    filterSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // Changed to a clean, light background (surface) matching the Global Minimalist theme
    // Reduced extreme padding (py-56) to more responsive values (py-24 md:py-32)
    <section className="relative bg-surface py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Updated text colors to textMain. Added tracking-tight for modern typography */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-textMain tracking-tight mb-6">
          Find What You Need to <span className="text-primary">Rent.</span>
        </h1>
        
        {/* Changed to textMuted so it doesn't fight with the main heading for attention */}
        <p className="text-lg md:text-xl text-textMuted mb-10 max-w-2xl mx-auto">
          Discover thousands of items available for rent in your area. A secure, fast, and easy marketplace.
        </p>

        {/* Search Form Area */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          {/* group class added to detect focus inside this container */}
          <div className="relative group flex items-center shadow-sm hover:shadow-md transition-shadow duration-300 rounded-full bg-white border border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            
            {/* Search Icon: Changes color when input is focused */}
            <Search className="absolute left-6 text-textMuted w-5 h-5 group-focus-within:text-primary transition-colors" />
            
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Removed default borders/outlines since the wrapper div handles it
              className="w-full pl-14 pr-32 py-4 text-lg bg-transparent border-none rounded-full focus:outline-none focus:ring-0 text-textMain placeholder:text-gray-400"
            />
            
            {/* Search Button moved INSIDE the input bar (Modern UI standard) */}
            <button
              type="submit"
              className="absolute right-2 bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-full font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Changed from a bulky button to a clean, elegant text link for exploring */}
        <button
          onClick={scrollToItems}
          className="text-textMuted hover:text-textMain font-medium underline decoration-gray-300 hover:decoration-primary underline-offset-4 transition-all"
        >
          Or explore all available items ↓
        </button>

      </div>
    </section>
  );
}