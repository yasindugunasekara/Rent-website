'use client';

import { useState } from 'react';
import Hero from '../components/Hero';
import UserHomeFeed from '../components/UserHomeFeed';
import Footer from '../components/Footer';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search requests directly from the Hero section
  const handleSearch = (term) => {
    setSearchTerm(term);
    // In a full implementation, you'd pass this to UserHomeFeed 
    // to filter the results.
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      
      <Hero onSearch={handleSearch} />
      
      <main className="flex-grow w-full" id="items">
        <UserHomeFeed search={searchTerm} />
      </main>

      <Footer />
    </div>
  );
}
