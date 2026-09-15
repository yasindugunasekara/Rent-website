import { ApiError } from "@/lib/api/response";

/** Parses a dynamic route segment as a positive integer id, or throws a 400. */
export function parseIntParam(value: string, name = "id"): number {
  const n = Number.parseInt(value, 10);
  if (!Number.isInteger(n) || n <= 0 || String(n) !== value.trim()) {
    throw new ApiError("bad_request", `Invalid ${name}.`);
  }
  return n;
}
