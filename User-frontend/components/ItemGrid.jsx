import ItemCard from './ItemCard';
import { Package } from 'lucide-react';

export default function ItemGrid({ items }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
        <p className="text-gray-500">Try adjusting your filters to see more results</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
