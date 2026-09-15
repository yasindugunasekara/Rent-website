import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { route } from "@/lib/api/handler";
import { created, ApiError } from "@/lib/api/response";
import { putObject, publicUrlFor } from "@/lib/storage";
import { logger } from "@/lib/logger";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB, checked before decoding
const MAX_FILES_PER_REQUEST = 8;
const MAX_DIMENSION = 2000;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

// POST /api/uploads — multipart image upload, session required.
//
// Every file is: size-capped before it's ever fully buffered, sniffed by
// magic bytes (not trusted from Content-Type or filename — the old backend
// had no upload endpoint at all, images were arbitrary URL strings the
// client typed in), then unconditionally re-encoded through sharp to WebP.
// Re-encoding (rather than just checking the type) is what actually strips
// EXIF/GPS metadata and neutralises polyglot files — a renamed .exe or an
// SVG with embedded script cannot survive a real image decode/re-encode.
export const POST = route({
  auth: true,
  rateLimit: { bucket: "upload" },
  async handler({ req }) {
    return handleUpload(req);
  },
});

async function handleUpload(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    throw new ApiError("unsupported_media_type", "Expected multipart/form-data.");
  }

  const form = await req.formData();
  const entries = form.getAll("files").filter((v): v is File => v instanceof File);

  if (entries.length === 0) {
    throw new ApiError("bad_request", "No files provided.");
  }
  if (entries.length > MAX_FILES_PER_REQUEST) {
    throw new ApiError("bad_request", `At most ${MAX_FILES_PER_REQUEST} files per request.`);
  }

  const results: { key: string; url: string }[] = [];

  for (const file of entries) {
    if (file.size > MAX_FILE_BYTES) {
      throw new ApiError("bad_request", `${file.name || "file"} exceeds the 5MB limit.`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffed = await fileTypeFromBuffer(buffer);

    if (!sniffed || !ALLOWED_MIME.has(sniffed.mime)) {
      throw new ApiError(
        "unsupported_media_type",
        "Only JPEG, PNG, WebP, or AVIF images are allowed.",
      );
    }

    let reencoded: Buffer;
    try {
      // No .withMetadata() call: sharp strips EXIF/ICC/GPS by default on a
      // fresh re-encode, which is exactly what we want here. .rotate() first
      // bakes in EXIF orientation so the image doesn't appear sideways once
      // that metadata is gone.
      reencoded = await sharp(buffer)
        .rotate()
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch (err) {
      logger.warn({ err }, "image re-encode failed, rejecting upload");
      throw new ApiError("bad_request", "Could not process this image.");
    }

    const key = `uploads/${randomUUID()}.webp`;
    await putObject(key, reencoded, "image/webp");
    results.push({ key, url: publicUrlFor(key) });
  }

  return created({ files: results });
}
