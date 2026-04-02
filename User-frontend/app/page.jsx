'use client';

import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FilterBar from '../components/FilterBar';
import ItemGrid from '../components/ItemGrid';
import Footer from '../components/Footer';
import { mockItems } from '../data/mockItems';

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    priceRange: '',
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  };

  const filteredItems = useMemo(() => {
    return mockItems.filter((item) => {
      const matchesSearch =
        !filters.search ||
        item.title.toLowerCase().includes(filters.search.toLowerCase());

      const matchesLocation =
        !filters.location || item.location === filters.location;

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

      return matchesSearch && matchesLocation && matchesPrice;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar onSearch={handleSearch} /> */}
      <Hero onSearch={handleSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="items">
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        <ItemGrid items={filteredItems} />
      </main>

      <Footer />
    </div>
  );
}
