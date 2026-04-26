import Image from "next/image";
import Link from "next/link";

export default function AdCard({ ad, onDeleteClick }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg border border-zinc-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      
      {/* IMAGE SECTION 
        'aspect-square' makes it perfectly square.
        Because the parent article has 'overflow-hidden' and no padding, 
        this image sits perfectly flush against the top, left, and right edges. 
      */}
      <div className="relative w-full aspect-square bg-zinc-50">
        <Image
          src={ad.image}
          alt={ad.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* DETAILS & BUTTONS SECTION 
        Padding is applied here instead of the main wrapper. 
      */}
      <div className="flex flex-col flex-grow p-5">
        <div className="space-y-1.5 mb-5">
          <h3 className="line-clamp-1 text-lg font-bold text-zinc-900">{ad.title}</h3>
          <p className="text-sm font-medium text-zinc-500">{ad.location}</p>
          <p className="text-base font-bold text-[#D4A353]">${ad.price}/day</p>
        </div>

        {/* BUTTONS */}
        <div className="mt-auto flex gap-3">
          <Link
            href={`/dashboard/edit/${ad.id}`}
            className="flex-1 rounded-xl bg-[#517E66] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2A5743] active:scale-[0.98]"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDeleteClick(ad)}
            className="flex-1 rounded-xl border-2 border-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:border-red-100 active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>
      
    </article>
  );
}