import Link from 'next/link';
import Image from 'next/image';
// Added Star icon for a professional touch (ratings)
import { MapPin, Star } from 'lucide-react';

export default function ItemCard({ item }) {
  return (
    // 'group' class allows us to trigger inner animations when the whole card is hovered
    <Link href={`/items/${item.id}`} className="group block h-full">
      {/* Changed to bg-surface. 
        Replaced extreme hover:scale-105 with a subtle hover:-translate-y-1 
        h-full and flex-col ensure all cards in a row are the same height 
      */}
      <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        
        {/* Image Container: Using aspect-ratio is more responsive than fixed h-48 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={item.image || '/placeholder.jpg'} // Fallback image path is best practice
            alt={item.title}
            fill
            // sizes prop is CRITICAL for Next.js image performance on different screens
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // Image slowly zooms in on hover (premium effect) while the card stays stable
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content Container: flex-grow fills the remaining space */}
        <div className="p-5 flex flex-col flex-grow">
          
          {/* Category & Rating (Makes it look like a real global marketplace) */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
              {item.category || 'Rental'}
            </span>
            <div className="flex items-center">
              <Star className="w-3.5 h-3.5 text-accent fill-current" />
              <span className="text-xs ml-1 font-medium text-textMuted">
                {item.rating || '4.8'}
              </span>
            </div>
          </div>

          {/* Title: textMain instead of primary. hover changes color to primary */}
          <h3 className="text-lg font-bold text-textMain mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {/* Location: mt-auto pushes the location and footer to the bottom evenly */}
          <div className="flex items-center text-textMuted mb-4 mt-auto">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="text-sm truncate">{item.location}</span>
          </div>

          {/* Footer: Price and Action Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {/* Changed price to success (Trust Green) to make it pop */}
              <span className="text-xl font-extrabold text-success">${item.price}</span>
              <span className="text-sm font-medium text-textMuted"> /day</span>
            </div>

            {/* CRITICAL FIX: Changed <button> to <div>. 
              You CANNOT have a <button> inside an <a> (Link) tag in HTML. 
            */}
            <div className="bg-primary group-hover:bg-primaryHover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              Rent Now
            </div>

          </div>
        </div>

      </div>
    </Link>
  );
}