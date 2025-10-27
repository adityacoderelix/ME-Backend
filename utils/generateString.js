export function generateUniqueString() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)];

  // UUID-like structure: 8-4-4-4-12 = 36 chars including 4 hyphens
  const sections = [8, 4, 4, 4, 12];
  return sections
    .map((len) => Array.from({ length: len }, randomChar).join(""))
    .join("-");
}
