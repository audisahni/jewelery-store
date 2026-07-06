// Shopify webhook HMAC verification using Web Crypto (Workers-native, no Node
// crypto). Shopify signs the RAW request body with the app's secret and sends
// the base64 digest in `X-Shopify-Hmac-Sha256`.

import "server-only";

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Constant-time comparison to avoid timing attacks on the signature.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string | null,
): Promise<boolean> {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));

  let expected: Uint8Array;
  try {
    expected = base64ToBytes(hmacHeader);
  } catch {
    return false;
  }
  return timingSafeEqual(new Uint8Array(signature), expected);
}
