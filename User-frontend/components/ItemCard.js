import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

export default function ItemCard({ item }) {
  return (
    <Link href={`/items/${item.id}`} className="block">
      <div className="bg-white rounded shadow-md overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
        
        <div className="relative h-48 w-full">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1">
            {item.title}
          </h3>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{item.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-accent">${item.price}</span>
              <span className="text-sm text-gray-500">/day</span>
            </div>

            {/* ✅ NO Link inside */}
            <button className="bg-primary text-white px-4 py-2 rounded-lg">
              View Details
            </button>

          </div>
        </div>

      </div>
    </Link>
  );
}