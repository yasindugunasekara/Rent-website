export const categoryOptions = [
  "vehicles",
  "electronics",
  "tools",
  "property",
  "furniture",
  "appliances",
  "travel",
  "sports",
];

export const locationOptions = [
  "New York",
  "San Francisco",
  "Chicago",
  "Dallas",
  "Seattle",
];

export const API_BASE_URL = "http://localhost:5079/api";

export const mockUsers = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    location: "Global",
  },
  {
    id: "publisher-1",
    name: "Ava Publisher",
    email: "ava.publisher@example.com",
    password: "password123",
    role: "publisher",
    phone: "+1 555 100 2000",
    location: "New York",
  },
];

export const mockUser = mockUsers[1];

export const mockAds = [
  {
    id: "ad-1",
    title: "Mountain Bike - Daily Rental",
    description: "Well-maintained bike with helmet included for city rides.",
    price: 25,
    location: "Seattle, WA, USA",
    latitude: 47.6062,
    longitude: -122.3321,
    category: "vehicles",
    contactNumber: "+1 555 220 1150",
    available: true,
    images: [{ imageUrl: "https://res.cloudinary.com/dcgfwnzzr/image/upload/v1758995063/cld-sample-5.jpg" }],
    createdAt: "2026-04-04T11:00:00.000Z",
  },
  {
    id: "ad-2",
    title: "Power Drill Set",
    description: "Cordless drill with full bit set, ideal for weekend projects.",
    price: 18,
    location: "Chicago, IL, USA",
    latitude: 41.8781,
    longitude: -87.6298,
    category: "tools",
    contactNumber: "+1 555 320 9999",
    available: true,
    images: [{ imageUrl: "https://res.cloudinary.com/dcgfwnzzr/image/upload/v1758995059/samples/shoe.jpg" }],
    createdAt: "2026-04-03T09:30:00.000Z",
  },{
    id: "ad-3",
    title: "Cozy 1-Bedroom Apartment",
    description: "Perfect for short stays, close to downtown and public transit.",
    price: 80,
    location: "New York, NY, USA",
    latitude: 40.7128,
    longitude: -74.0060,
    category: "property",
    contactNumber: "+1 555 450 1234",
    available: true,
    images: [{ imageUrl: "https://res.cloudinary.com/dcgfwnzzr/image/upload/v1758995059/samples/shoe.jpg" }],
    createdAt: "2026-04-02T14:15:00.000Z",
  }
];
