import { NextResponse } from "next/server";

/**
 * Uniform API envelope. Error responses carry a stable machine-readable `code`
 * and a message that is always safe to show a client — the real exception
 * detail goes to the logger only, never to the response body. This is the
 * fix for the old backend's `Internal server error: {ex.Message}` leak.
 */
export function ok<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json({ data }, typeof init === "number" ? { status: init } : init);
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export type ApiErrorCode =
  | "bad_request"
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "unsupported_media_type"
  | "internal_error";

const statusByCode: Record<ApiErrorCode, number> = {
  bad_request: 400,
  validation_error: 422,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  unsupported_media_type: 415,
  internal_error: 500,
};

export function fail(code: ApiErrorCode, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { error: { code, message, ...extra } },
    { status: statusByCode[code] },
  );
}

export class ApiError extends Error {
  code: ApiErrorCode;
  extra?: Record<string, unknown>;

  constructor(code: ApiErrorCode, message: string, extra?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.extra = extra;
  }
}
