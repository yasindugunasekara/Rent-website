/**
 * Haversine great-circle distance in kilometers. Ported from the old
 * backend's AdsController.CalculateDistance/ToRadians — kept here for the
 * batch/single-ad endpoints where sorting a handful of rows in JS is fine.
 * The main list endpoint (potentially large) does the same formula as a raw
 * SQL expression so Postgres can sort/paginate without loading every row —
 * see haversineSql() below.
 */
const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

import { Prisma } from "@prisma/client";

/**
 * Raw-SQL Haversine expression as a parameter-bound Prisma.Sql fragment (not
 * string interpolation), for use inside a $queryRaw call so the database can
 * compute and sort by distance directly instead of pulling the whole
 * filtered table into Node to sort in memory (the old backend's
 * `ToListAsync()` before `Skip/Take` bug).
 */
export function haversineSqlExpression(lat: number, lng: number): Prisma.Sql {
  return Prisma.sql`(
    ${EARTH_RADIUS_KM} * acos(
      LEAST(1, GREATEST(-1,
        cos(radians(${lat})) * cos(radians("latitude")) *
        cos(radians("longitude") - radians(${lng})) +
        sin(radians(${lat})) * sin(radians("latitude"))
      ))
    )
  )`;
}
