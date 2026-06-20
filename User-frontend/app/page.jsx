'use client';

import { useState, Suspense } from 'react';
import Hero from '../components/Hero';
import UserHomeFeed from '../components/UserHomeFeed';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      
      <Suspense fallback={<div className="h-40 bg-surface animate-pulse w-full" />}>
        <Hero />
      </Suspense>
      
      <main className="flex-grow w-full" id="items">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-72 animate-pulse" />
              ))}
            </div>
          </div>
        }>
          <UserHomeFeed />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
