// URL-safe base64 JSON codec — shared by report/invoice share links.

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** Serialize a payload to a URL-safe base64 string (no padding). */
export function encodeShareData(payload: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** Parse a URL-safe base64 string back to a payload, or null if malformed. */
export function decodeShareData<T>(value: string): T | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(new TextDecoder().decode(base64ToBytes(padded))) as T;
  } catch {
    return null;
  }
}
