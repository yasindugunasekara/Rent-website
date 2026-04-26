'use client';

// Added ChevronDown for custom select dropdown arrows
import { Search, MapPin, DollarSign, ChevronDown } from 'lucide-react';

export default function FilterBar({ filters, onFilterChange }) {
  return (
    // Changed bg-white to bg-surface. Softened the shadow and added a subtle border
    <div className="bg-surface shadow-sm border border-gray-100 rounded-2xl p-6 mb-8">
      
      {/* Increased gap from 4 to 6 for better breathing room between inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- Search Filter --- */}
        <div className="relative flex flex-col gap-2">
          {/* Added htmlFor for accessibility (screen readers) */}
          <label htmlFor="search-filter" className="text-sm font-semibold text-textMain">
            Search
          </label>
          <div className="relative group">
            {/* Icon lights up with primary color when input is focused */}
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4 group-focus-within:text-primary transition-colors" />
            <input
              id="search-filter"
              type="text"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              // Used bg-background for input fields. Added primary focus rings
              className="w-full px-4 py-3 pl-11 bg-background border border-gray-200 text-textMain rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* --- Location Filter --- */}
        <div className="relative flex flex-col gap-2">
          <label htmlFor="location-filter" className="text-sm font-semibold text-textMain">
            Location
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4 group-focus-within:text-primary transition-colors" />
            <select
              id="location-filter"
              value={filters.location}
              onChange={(e) => onFilterChange('location', e.target.value)}
              // appearance-none removes default OS styling. Added cursor-pointer
              className="w-full px-4 py-3 pl-11 pr-10 bg-background border border-gray-200 text-textMain rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">All Locations</option>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Chicago">Chicago</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Miami">Miami</option>
            </select>
            {/* Custom dropdown arrow icon. pointer-events-none ensures clicks pass through to the select */}
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* --- Price Range Filter --- */}
        <div className="relative flex flex-col gap-2">
          <label htmlFor="price-filter" className="text-sm font-semibold text-textMain">
            Price Range
          </label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4 group-focus-within:text-primary transition-colors" />
            <select
              id="price-filter"
              value={filters.priceRange}
              onChange={(e) => onFilterChange('priceRange', e.target.value)}
              className="w-full px-4 py-3 pl-11 pr-10 bg-background border border-gray-200 text-textMain rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">All Prices</option>
              <option value="0-50">$0 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200+">$200+</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}