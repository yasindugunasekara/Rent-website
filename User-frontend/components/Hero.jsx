'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryNav from './CategoryNav';

export default function Hero() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Handle the search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      router.push(`/?search=${encodeURIComponent(searchTerm)}#items`);
    } else {
      router.push(`/#items`);
    }
  };

  // Smooth scroll to the items section
  const scrollToItems = () => {
    const filterSection = document.getElementById('items');
    filterSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-surface py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
      <div className="max-w-5xl mx-auto text-center">
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-textMain tracking-tight mb-6">
          Find your next rental <span className="text-[#003B95]">anywhere.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-textMuted mb-10 max-w-2xl mx-auto">
          Search for cars, tools, spaces, and electronics from trusted people in your community.
        </p>

        {/* Search Form Area */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative group flex items-center shadow-sm hover:shadow-md transition-shadow duration-300 rounded-full bg-white border border-gray-200 focus-within:border-[#003B95] focus-within:ring-4 focus-within:ring-[#003B95]/10">
            
            <Search className="absolute left-6 text-textMuted w-5 h-5 group-focus-within:text-[#003B95] transition-colors" />
            
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-32 py-4 text-lg bg-transparent border-none rounded-full focus:outline-none focus:ring-0 text-textMain placeholder:text-gray-400"
            />
            
            <button
              type="submit"
              className="absolute right-2 bg-[#003B95] hover:bg-[#002b6e] text-white px-6 py-2.5 rounded-full font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Navigation Section */}
        <CategoryNav />

        <div className="mt-12">
          <button
            onClick={scrollToItems}
            className="text-textMuted hover:text-textMain font-medium underline decoration-gray-300 hover:decoration-[#003B95] underline-offset-4 transition-all"
          >
            Or explore all available items ↓
          </button>
        </div>

      </div>
    </section>
  );
}