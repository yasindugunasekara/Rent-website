// The one place either frontend talks to /api/**. Replaces nine hardcoded
// `http://localhost:5079/api` call sites across the old two frontends. Every
// call is same-origin and relative — no base URL, no CORS, and the session
// cookie rides along automatically (no Authorization header to manage).

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers:
      init?.body instanceof FormData
        ? init.headers
        : { "Content-Type": "application/json", ...init?.headers },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.error?.message ?? `Request failed (${res.status})`;
    throw new ApiClientError(message, res.status, json?.error?.code);
  }

  return json?.data as T;
}

// `object` (not `Record<string, unknown>`) so a plain interface like
// AdListParams can be passed without needing an index signature.
function qs(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, unknown][]) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

// ---- Types ---------------------------------------------------------------

export interface AdImageDto {
  id: number;
  url: string;
}

export interface AdDto {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  contactNumber: string;
  available: boolean;
  createdAt: string;
  images: AdImageDto[];
  distanceKm: number | null;
}

export interface PublicPublisherDto {
  firstName: string;
  lastNameInitial: string;
  bio: string | null;
  profilePicUrl: string | null;
  memberSince: string;
}

export interface AdWithPublisherDto extends AdDto {
  publisher: PublicPublisherDto;
}

export interface SessionUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "PUBLISHER" | "ADMIN";
  preferredCurrency: string;
  profilePicUrl: string | null;
}

export interface ProfileDto extends SessionUserDto {
  phone: string | null;
  location: string | null;
  bio: string | null;
  emailVerified: boolean;
}

export interface AdListParams {
  lat?: number;
  lng?: number;
  search?: string;
  category?: string;
  locationFilter?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  page?: number;
  limit?: number;
}

export interface AdInput {
  title: string;
  description: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  category: string;
  contactNumber: string;
  available?: boolean;
  currency?: string;
  images: { key: string; url: string }[];
}

// ---- Ads -------------------------------------------------------------

export function listAds(params: AdListParams) {
  return request<{ items: AdDto[]; page: number; hasMore: boolean }>(`/api/ads${qs(params)}`);
}

export function getAd(id: number | string) {
  return request<AdWithPublisherDto>(`/api/ads/${id}`);
}

export function getAdsBatch(ids: (number | string)[]) {
  if (ids.length === 0) return Promise.resolve({ items: [] as AdDto[] });
  return request<{ items: AdDto[] }>(`/api/ads/batch${qs({ ids: ids.join(",") })}`);
}

export function getMyAds(params: { page?: number; limit?: number } = {}) {
  return request<{ items: AdDto[] }>(`/api/ads/mine${qs(params)}`);
}

export function createAd(input: AdInput) {
  return request<AdDto>("/api/ads", { method: "POST", body: JSON.stringify(input) });
}

export function updateAd(id: number | string, input: Partial<AdInput>) {
  return request<AdDto>(`/api/ads/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function setAdAvailability(id: number | string, available: boolean) {
  return request<AdDto>(`/api/ads/${id}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ available }),
  });
}

export function deleteAd(id: number | string) {
  return request<void>(`/api/ads/${id}`, { method: "DELETE" });
}

// ---- Currency --------------------------------------------------------

export function getCurrencyCodes() {
  return request<{ code: string; name: string }[]>("/api/currency/codes");
}

export function getExchangeRate(to: string) {
  return request<{ rate: number }>(`/api/currency/rate${qs({ to })}`);
}

// ---- Auth --------------------------------------------------------------

export function register(input: { firstName: string; lastName: string; email: string; password: string }) {
  return request<{ message: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return request<SessionUserDto>("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
}

export function logout() {
  return request<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export function getSession() {
  return request<{ user: SessionUserDto | null }>("/api/auth/session");
}

// ---- Profile -----------------------------------------------------------

export function getProfile() {
  return request<ProfileDto>("/api/profile");
}

export function updateProfile(input: Partial<Omit<ProfileDto, "id" | "role" | "emailVerified">>) {
  return request<ProfileDto>("/api/profile", { method: "PATCH", body: JSON.stringify(input) });
}

export function changePassword(input: { currentPassword: string; newPassword: string }) {
  return request<{ message: string }>("/api/profile/password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---- Uploads -----------------------------------------------------------

export function uploadImages(files: File[]) {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return request<{ files: { key: string; url: string }[] }>("/api/uploads", {
    method: "POST",
    body: form,
  });
}
