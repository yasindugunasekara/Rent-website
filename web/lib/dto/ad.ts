import type { Ad, AdImage, User } from "@prisma/client";
import { toPublicPublisherDto } from "@/lib/dto/user";

type AdWithImages = Ad & { images: AdImage[] };
type AdWithImagesAndDistance = AdWithImages & { distanceKm?: number | null };
type AdWithPublisher = AdWithImages & { publisher: User };

/**
 * The single place an Ad row becomes a client-facing object, in every
 * direction (list, single, mine). Images are always `{ id, url }` — the old
 * backend's read shape (`images[].imageUrl`) vs write shape (`imageUrls:
 * string[]`) asymmetry doesn't exist here; create/update also take
 * `images: [{ key, url }]`.
 */
export function toAdDto(ad: AdWithImagesAndDistance) {
  return {
    id: ad.id,
    title: ad.title,
    description: ad.description,
    price: Number(ad.priceUsd),
    location: ad.location,
    latitude: ad.latitude,
    longitude: ad.longitude,
    category: ad.category,
    contactNumber: ad.contactNumber,
    available: ad.available,
    createdAt: ad.createdAt,
    images: ad.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({ id: img.id, url: img.url })),
    distanceKm: ad.distanceKm ?? null,
  };
}

export function toAdWithPublisherDto(ad: AdWithPublisher) {
  return {
    ...toAdDto(ad),
    publisher: toPublicPublisherDto(ad.publisher),
  };
}

export function toMineDto(ad: AdWithImages) {
  return toAdDto(ad);
}
