'use client';

import ItemCard from './ItemCard';
// PackageSearch is a more meaningful icon for "searching items"
import { PackageSearch } from 'lucide-react';

// Added onClearFilters prop so users can easily reset if no items are found
export default function ItemGrid({ items, onClearFilters }) {
  
  // --- EMPTY STATE ---
  // If there are no items, show a beautiful, actionable empty state
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-surface border border-gray-100 rounded-3xl shadow-sm animate-fadeIn">
        {/* Icon Container with subtle background */}
        <div className="bg-background p-6 rounded-full mb-6">
          <PackageSearch className="w-12 h-12 text-primary" />
        </div>
        
        <h3 className="text-2xl font-bold text-textMain mb-3">
          No items found
        </h3>
        
        <p className="text-textMuted max-w-md mx-auto mb-8 leading-relaxed">
          We couldn't find any items matching your current filters. Try adjusting your search or explore other categories.
        </p>
        
        {/* Call to Action Button: Keeps the user engaged instead of leaving the site */}
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  // --- GRID STATE ---
  return (
    // Expanded grid columns for larger screens (xl:grid-cols-4)
    // Added animate-fadeIn for a smooth loading effect
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-fadeIn">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}