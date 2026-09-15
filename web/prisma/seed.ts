import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

const ARGON2_OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

const CATEGORIES = ["vehicles", "electronics", "tools", "property", "furniture", "appliances", "travel", "sports"];

const SAMPLE_IMAGES = [
  "https://images.pexels.com/photos/9779/pexels-photo-97079.jpeg",
  "https://images.pexels.com/photos/210728/pexels-photo-210728.jpeg",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
  "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg",
];

const CITIES = [
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298 },
  { name: "Dallas", lat: 32.7767, lng: -96.797 },
  { name: "Seattle", lat: 47.6062, lng: -122.3321 },
];

const LISTINGS = [
  { title: "Compact SUV, weekend-ready", category: "vehicles", price: 65 },
  { title: "Electric mountain bike", category: "vehicles", price: 35 },
  { title: "4K mirrorless camera kit", category: "electronics", price: 45 },
  { title: "Portable projector + screen", category: "electronics", price: 20 },
  { title: "Cordless drill & tool set", category: "tools", price: 15 },
  { title: "Pressure washer, 2000 PSI", category: "tools", price: 25 },
  { title: "Sunny 2BR downtown apartment", category: "property", price: 120 },
  { title: "Lakeside cabin, sleeps 6", category: "property", price: 180 },
  { title: "Mid-century modern sofa", category: "furniture", price: 30 },
  { title: "Folding banquet tables (x4)", category: "furniture", price: 18 },
  { title: "Countertop espresso machine", category: "appliances", price: 12 },
  { title: "Commercial stand mixer", category: "appliances", price: 22 },
  { title: "4-person camping tent", category: "travel", price: 28 },
  { title: "Roof-top cargo carrier", category: "travel", price: 16 },
  { title: "Paddleboard with paddle & vest", category: "sports", price: 24 },
];

async function main() {
  const passwordHash = await hash("DevPassword123!", ARGON2_OPTS);

  const publisherA = await prisma.user.upsert({
    where: { email: "ava.publisher@example.com" },
    update: {},
    create: {
      email: "ava.publisher@example.com",
      passwordHash,
      firstName: "Ava",
      lastName: "Publisher",
      phone: "+1 555 100 2000",
      location: "New York",
      bio: "Listing quality gear since 2021.",
      preferredCurrency: "USD",
      emailVerified: true,
    },
  });

  const publisherB = await prisma.user.upsert({
    where: { email: "sam.rentals@example.com" },
    update: {},
    create: {
      email: "sam.rentals@example.com",
      passwordHash,
      firstName: "Sam",
      lastName: "Rentals",
      phone: "+1 555 200 3000",
      location: "Seattle",
      bio: "Outdoor and travel gear specialist.",
      preferredCurrency: "USD",
      emailVerified: true,
    },
  });

  const publishers = [publisherA, publisherB];

  const existingCount = await prisma.ad.count();
  if (existingCount > 0) {
    console.log(`Skipping ad seed — ${existingCount} ads already exist.`);
  } else {
    for (const [i, listing] of LISTINGS.entries()) {
      const city = CITIES[i % CITIES.length]!;
      const publisher = publishers[i % publishers.length]!;
      await prisma.ad.create({
        data: {
          title: listing.title,
          description: `${listing.title} available for rent in ${city.name}. Great condition, flexible pickup.`,
          priceUsd: listing.price,
          location: city.name,
          latitude: city.lat + (Math.random() - 0.5) * 0.05,
          longitude: city.lng + (Math.random() - 0.5) * 0.05,
          category: listing.category,
          contactNumber: publisher.phone ?? "+1 555 000 0000",
          available: true,
          publisherId: publisher.id,
          images: {
            create: [0, 1].map((n) => ({
              url: SAMPLE_IMAGES[(i + n) % SAMPLE_IMAGES.length]!,
              sortOrder: n,
            })),
          },
        },
      });
    }
    console.log(`Seeded ${LISTINGS.length} ads across ${CATEGORIES.length} categories.`);
  }

  console.log("Seed complete. Dev logins (password: DevPassword123!):");
  console.log(`  - ${publisherA.email}`);
  console.log(`  - ${publisherB.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
