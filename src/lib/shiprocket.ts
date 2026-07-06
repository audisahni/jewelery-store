// Shiprocket integration — pincode serviceability + delivery ETA for the
// product page. Runs on the Cloudflare edge.
//
// NOTE ON SCOPE: with Shopify-hosted checkout, the authoritative shipping RATE
// and fulfillment are handled Shopify-side (Shiprocket's Shopify app on the
// order/fulfillment side). What we build here is the PRE-checkout serviceability
// + ETA widget shown on the product page — a direct read against Shiprocket's
// courier serviceability API that adds real UX value before the customer commits.
//
// Auth: email/password -> bearer token (valid ~10 days). We cache the token in
// isolate memory and re-login on expiry/401.

import "server-only";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}
let tokenCache: TokenCache | null = null;

export class ShiprocketError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "ShiprocketError";
    this.status = status;
  }
}

async function login(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new ShiprocketError("Shiprocket not configured (SHIPROCKET_EMAIL/PASSWORD)", 500);
  }

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new ShiprocketError(`Shiprocket auth failed (${res.status})`, 502);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new ShiprocketError("Shiprocket auth returned no token", 502);

  // Token is valid ~10 days; refresh a day early to be safe.
  tokenCache = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return data.token;
}

async function getToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }
  return login();
}

export interface ServiceabilityResult {
  serviceable: boolean;
  pincode: string;
  cod: boolean; // cash-on-delivery available
  estimatedDays: number | null;
  etd: string | null; // human ETA date if provided
  cheapestRate: number | null; // rupees
  courier: string | null;
}

/**
 * Check whether `deliveryPincode` is serviceable from the store's pickup pincode,
 * returning the fastest courier's ETA and cheapest rate.
 */
export async function checkServiceability(
  deliveryPincode: string,
  opts?: { weightKg?: number; cod?: boolean },
): Promise<ServiceabilityResult> {
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickup) throw new ShiprocketError("SHIPROCKET_PICKUP_PINCODE not set", 500);

  const params = new URLSearchParams({
    pickup_postcode: pickup,
    delivery_postcode: deliveryPincode,
    weight: String(opts?.weightKg ?? 0.5),
    cod: opts?.cod ? "1" : "0",
  });

  const request = async (token: string) =>
    fetch(`${SHIPROCKET_BASE}/courier/serviceability/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

  let res = await request(await getToken());
  if (res.status === 401) {
    // Token expired/invalidated — refresh once and retry.
    res = await request(await getToken(true));
  }

  if (res.status === 404) {
    return emptyResult(deliveryPincode);
  }
  if (!res.ok) {
    throw new ShiprocketError(`Shiprocket serviceability failed (${res.status})`, 502);
  }

  const data = (await res.json()) as {
    data?: {
      available_courier_companies?: Array<{
        courier_name: string;
        estimated_delivery_days: string;
        etd: string;
        rate: number;
        cod: number;
      }>;
    };
  };

  const couriers = data.data?.available_courier_companies ?? [];
  if (!couriers.length) return emptyResult(deliveryPincode);

  const fastest = [...couriers].sort(
    (a, b) => Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days),
  )[0];
  const cheapest = [...couriers].sort((a, b) => a.rate - b.rate)[0];

  return {
    serviceable: true,
    pincode: deliveryPincode,
    cod: couriers.some((c) => c.cod === 1),
    estimatedDays: Number(fastest.estimated_delivery_days) || null,
    etd: fastest.etd || null,
    cheapestRate: cheapest?.rate ?? null,
    courier: fastest.courier_name || null,
  };
}

function emptyResult(pincode: string): ServiceabilityResult {
  return {
    serviceable: false,
    pincode,
    cod: false,
    estimatedDays: null,
    etd: null,
    cheapestRate: null,
    courier: null,
  };
}
