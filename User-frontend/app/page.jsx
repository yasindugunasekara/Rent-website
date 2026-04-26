'use client';

import { useState, useMemo } from 'react';
// Imported the DashboardNavbar we created earlier
import Hero from '../components/Hero';
import FilterBar from '../components/FilterBar';
import ItemGrid from '../components/ItemGrid';
import Footer from '../components/Footer';

// We will replace this with a real .NET API fetch in Phase 2
import { mockItems } from '../data/mockItems'; 

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    priceRange: '',
  });

  // Handle individual filter changes from the FilterBar
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle search requests directly from the Hero section
  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  };

  // --- NEW FEATURE ---
  // Reset all filters when "Clear All Filters" button is clicked in the Empty State
  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: '',
      priceRange: '',
    });
  };

  // useMemo ensures we only recalculate filtered items when 'filters' change
  // This drastically improves performance on large datasets
  const filteredItems = useMemo(() => {
    return mockItems.filter((item) => {
      // Check search match
      const matchesSearch =
        !filters.search ||
        item.title.toLowerCase().includes(filters.search.toLowerCase());

      // Check location match
      const matchesLocation =
        !filters.location || item.location === filters.location;

      // Check price range match
      let matchesPrice = true;
      if (filters.priceRange) {
        if (filters.priceRange === '0-50') {
          matchesPrice = item.price >= 0 && item.price <= 50;
        } else if (filters.priceRange === '50-100') {
          matchesPrice = item.price > 50 && item.price <= 100;
        } else if (filters.priceRange === '100-200') {
          matchesPrice = item.price > 100 && item.price <= 200;
        } else if (filters.priceRange === '200+') {
          matchesPrice = item.price > 200;
        }
      }

      // Item must match ALL active filters to be displayed
      return matchesSearch && matchesLocation && matchesPrice;
    });
  }, [filters]); 

  return (
    // Changed bg-gray-50 to our global theme's bg-background
    // Added flex flex-col to ensure the footer stays at the bottom
    <div className="min-h-screen flex flex-col bg-background">
      
      {/* Added the DashboardNavbar to the top of the page */}
      
      <Hero onSearch={handleSearch} />
      
      {/* flex-grow allows this section to expand, pushing the footer down */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full" id="items">
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        
        {/* Passed handleClearFilters to power the empty state button we built */}
        <ItemGrid items={filteredItems} onClearFilters={handleClearFilters} />
      </main>

      {/* Assuming you have a Footer component in your project */}
      <Footer />
    </div>
  );
}