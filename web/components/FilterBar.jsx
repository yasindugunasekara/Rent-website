'use client';

import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCurrency } from '../lib/CurrencyContext';

export default function FilterBar({ filters, onApplyFilters }) {
  const { currency } = useCurrency();
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [localLocation, setLocalLocation] = useState(filters.location || '');
  const [localCategory, setLocalCategory] = useState(filters.category || '');
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange || '');

  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  // Sync state when parent props change (e.g. from Hero)
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

  const handlePriceToggle = (priceVal) => {
    const nextPrice = localPriceRange === priceVal ? '' : priceVal;
    setLocalPriceRange(nextPrice);
    onApplyFilters({
      search: localSearch,
      location: localLocation,
      category: localCategory,
      priceRange: nextPrice
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

  const PRICE_OPTIONS = [
    { label: `Under 50 ${currency}`, value: '0-50' },
    { label: `50 - 100 ${currency}`, value: '50-100' },
    { label: `100 - 250 ${currency}`, value: '100-250' },
    { label: `250 - 500 ${currency}`, value: '250-500' },
    { label: `500 - 1000 ${currency}`, value: '500-1000' },
    { label: `1000+ ${currency}`, value: '1000+' }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-5 mb-12 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full">
        
        {/* --- Search Group --- */}
        <div className="flex items-center flex-grow lg:flex-[2] border border-gray-200 rounded-2xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#003B95]/15 focus-within:border-[#003B95] transition-all relative shrink-0">
          <Search className="absolute left-4 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search with title"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-24 py-3.5 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400 font-semibold"
          />
          {localSearch && (
            <button 
              onClick={() => setLocalSearch('')}
              className="absolute right-[5.5rem] top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleApply}
            className="absolute right-0 top-0 bottom-0 bg-[#003B95] hover:bg-[#002b6e] text-white text-sm font-bold px-5 transition-colors flex items-center justify-center"
          >
            Search
          </button>
        </div>

        {/* --- Location Input --- */}
        <div className="relative flex items-center flex-grow lg:flex-[1] border border-gray-200 rounded-2xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#003B95]/15 focus-within:border-[#003B95] transition-all shrink-0">
          <MapPin className="absolute left-4 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Location"
            value={localLocation}
            onChange={(e) => setLocalLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400 font-semibold"
          />
        </div>

        {/* --- Price Filter Dropdown --- */}
        <div className="relative flex-grow lg:flex-[1] shrink-0">
          <button 
            onClick={() => {
              setShowPriceDropdown(!showPriceDropdown);
            }}
            className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm font-semibold text-gray-700 flex items-center justify-between transition-all focus:outline-none focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/15
              ${showPriceDropdown ? 'border-[#003B95] ring-2 ring-[#003B95]/15' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <span className="truncate">
              {localPriceRange 
                ? PRICE_OPTIONS.find(o => o.value === localPriceRange)?.label 
                : 'Filter by price'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showPriceDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showPriceDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowPriceDropdown(false)} />
              <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-4 space-y-2 animate-fadeIn">
                {PRICE_OPTIONS.map((opt) => {
                  const isChecked = localPriceRange === opt.value;
                  return (
                    <label key={opt.value} className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900 cursor-pointer py-1.5 transition-colors">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handlePriceToggle(opt.value)}
                        className="rounded text-[#003B95] focus:ring-[#003B95]/20 border-gray-300 w-4 h-4 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* --- Clear Filters Button --- */}
        <button
          onClick={handleClearAll}
          className="w-full lg:w-auto px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm active:scale-95 text-center shrink-0 flex-none"
        >
          Clear filters
        </button>

      </div>
    </div>
  );
}