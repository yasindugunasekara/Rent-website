import type { User } from "@prisma/client";

/**
 * The only place a User row is turned into a client-facing object. Every
 * route must go through this (or userProfileDto below) instead of returning
 * a raw Prisma row — this is what stops a future column addition (or a
 * careless `return user`) from leaking `passwordHash` etc., which is exactly
 * how the old `/api/Ads/my-ads` endpoint leaked raw entities.
 */
export function toSessionUserDto(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    preferredCurrency: user.preferredCurrency,
    profilePicUrl: user.profilePicUrl,
  };
}

/** Fuller profile view for the authenticated user's own /api/profile. */
export function toProfileDto(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    profilePicUrl: user.profilePicUrl,
    preferredCurrency: user.preferredCurrency,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

/**
 * Minimal, non-sensitive publisher block shown on a public ad page. The old
 * backend's GET /api/Ads/{id} returned the publisher's email/phone/location/
 * bio here (AdsController.cs:183-192) despite a comment claiming otherwise —
 * this type makes that leak structurally impossible to reintroduce.
 */
export function toPublicPublisherDto(user: User) {
  return {
    firstName: user.firstName,
    lastNameInitial: user.lastName ? `${user.lastName[0]}.` : "",
    // `bio` is self-authored, publisher-facing text (like a shop description)
    // rather than contact info, so it's fine to show here. email/phone/
    // location are not — see the file header.
    bio: user.bio,
    profilePicUrl: user.profilePicUrl,
    memberSince: user.createdAt,
  };
}
