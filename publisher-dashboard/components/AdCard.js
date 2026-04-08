import Image from "next/image";
import Link from "next/link";

export default function AdCard({ ad, onDeleteClick }) {
  return (
    <article className="rounded-2xl bg-white p-3 shadow-md transition duration-200 hover:scale-[1.01]">
      <div className="relative h-44 overflow-hidden rounded-xl">
        <Image
          src={ad.image}
          alt={ad.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="space-y-2 p-1 pt-3">
        <h3 className="line-clamp-1 text-base font-semibold text-[#0B3D2E]">{ad.title}</h3>
        <p className="text-sm text-zinc-500">{ad.location}</p>
        <p className="font-semibold text-[#C89B3C]">${ad.price}/day</p>
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/dashboard/edit/${ad.id}`}
          className="flex-1 rounded-xl bg-[#5C8A64] px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-[#4a7251]"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => onDeleteClick(ad)}
          className="flex-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
