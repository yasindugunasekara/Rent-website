'use client';

import { Search, MapPin, DollarSign, ChevronDown, Layers, X, RotateCcw, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCurrency } from '../lib/CurrencyContext';

export default function FilterBar({ filters, onApplyFilters }) {
  const { currency } = useCurrency();
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [localLocation, setLocalLocation] = useState(filters.location || '');
  const [localCategory, setLocalCategory] = useState(filters.category || '');
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange || '');

  // Update local states when props change (e.g. from Hero or URL refresh)
  useEffect(() => {
    setLocalSearch(filters.search || '');
    setLocalLocation(filters.location || '');
    setLocalCategory(filters.category || '');
    setLocalPriceRange(filters.priceRange || '');
  }, [filters.search, filters.location, filters.category, filters.priceRange]);

  const handleApply = () => {
    onApplyFilters({
      search: localSearch,
      location: localLocation,
      category: localCategory,
      priceRange: localPriceRange
    });
  };

  const handleClearAll = () => {
    setLocalSearch('');
    setLocalLocation('');
    setLocalCategory('');
    setLocalPriceRange('');
    onApplyFilters({
      search: '',
      location: '',
      category: '',
      priceRange: ''
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const hasActiveFilters = filters.search || filters.category || filters.location || filters.priceRange;

  return (
    <div className="bg-white shadow-xl shadow-gray-100/50 border border-gray-100 rounded-3xl p-6 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* --- Search Filter --- */}
        <div className="flex flex-col gap-2">
          <label htmlFor="search-filter" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
            Search
          </label>
          <div className="relative group">
            <button 
              onClick={handleApply}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors z-10"
              title="Click to search"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              id="search-filter"
              type="text"
              placeholder="What are you looking for?"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3.5 pl-11 pr-10 bg-gray-50 border-none text-gray-900 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400 font-medium"
            />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* --- Category Filter --- */}
        <div className="flex flex-col gap-2">
          <label htmlFor="category-filter" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
            Category
          </label>
          <div className="relative group">
            <Layers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
            <select
              id="category-filter"
              value={localCategory}
              onChange={(e) => setLocalCategory(e.target.value)}
              className="w-full px-4 py-3.5 pl-11 pr-10 bg-gray-50 border-none text-gray-900 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all duration-200 appearance-none cursor-pointer font-medium"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Home">Home & Garden</option>
              <option value="Tools">Tools</option>
              <option value="Events">Events & Party</option>
              <option value="Sports">Sports & Outdoors</option>
              <option value="Travel">Travel</option>
              <option value="Books">Books & Media</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* --- Location Filter --- */}
        <div className="flex flex-col gap-2">
          <label htmlFor="location-filter" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
            Location
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
            <input
              id="location-filter"
              type="text"
              placeholder="Anywhere"
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3.5 pl-11 pr-10 bg-gray-50 border-none text-gray-900 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all duration-200 placeholder:text-gray-400 font-medium"
            />
            {localLocation && (
              <button 
                onClick={() => setLocalLocation('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* --- Price Range Filter --- */}
        <div className="flex flex-col gap-2">
          <label htmlFor="price-filter" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
            Price Range ({currency})
          </label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
            <select
              id="price-filter"
              value={localPriceRange}
              onChange={(e) => setLocalPriceRange(e.target.value)}
              className="w-full px-4 py-3.5 pl-11 pr-10 bg-gray-50 border-none text-gray-900 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all duration-200 appearance-none cursor-pointer font-medium"
            >
              <option value="">Any Price</option>
              <option value="0-50">Under 50 {currency}</option>
              <option value="50-100">50 - 100 {currency}</option>
              <option value="100-250">100 - 250 {currency}</option>
              <option value="250-500">250 - 500 {currency}</option>
              <option value="500-1000">500 - 1000 {currency}</option>
              <option value="1000+">1000+ {currency}</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* --- Action Buttons --- */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-gray-50 pt-6">
        <button
          onClick={handleApply}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all active:scale-95"
        >
          <Filter className="w-4 h-4" />
          Apply Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}