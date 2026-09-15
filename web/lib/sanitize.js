export function sanitizeText(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

export function sanitizePhone(value) {
  if (typeof value !== "string") return "";

  return value.replace(/[^0-9+\-\s()]/g, "").trim().slice(0, 25);
}
