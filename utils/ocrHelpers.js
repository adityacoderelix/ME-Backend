const fs = require("fs");

function isDataUri(str) {
  return typeof str === "string" && /^data:\w+\/[\w+.-]+;base64,/.test(str);
}

function rawBase64FromPossibleDataUri(input) {
  if (!input) return null;
  if (isDataUri(input)) return input.split(",")[1];
  return input; // assume raw base64 or URL handled separately
}

function isValidBase64(str) {
  if (!str || typeof str !== "string") return false;
  const cleaned = str.replace(/\s+/g, "");
  if (cleaned.length % 4 !== 0) return false;
  if (/[^A-Za-z0-9+/=]/.test(cleaned)) return false;
  return true;
}

function detectMimeFromBuffer(buf) {
  if (!Buffer.isBuffer(buf)) return "application/octet-stream";
  const hex = buf.slice(0, 8).toString("hex").toLowerCase();
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e47")) return "image/png";
  if (buf.slice(0, 4).toString() === "%PDF") return "application/pdf";
  return "application/octet-stream";
}

module.exports = {
  rawBase64FromPossibleDataUri,
  isValidBase64,
  detectMimeFromBuffer,
};
