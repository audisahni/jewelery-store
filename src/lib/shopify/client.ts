// Low-level Shopify Storefront API client.
//
// Runs on the Cloudflare edge via the standard `fetch` (Workers-native).
// Reads config from `process.env` (populated from wrangler [vars] + secrets by
// the OpenNext Cloudflare adapter — same pattern as lib/email.ts).

const DEFAULT_API_VERSION = "2025-04";

interface ShopifyFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  // Next fetch cache controls. Catalog reads should cache + tag; cart mutations
  // must pass `cache: "no-store"`.
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
}

export class ShopifyError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ShopifyError";
    this.status = status;
    this.details = details;
  }
}

function getEndpoint(): { url: string; token: string } {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION || DEFAULT_API_VERSION;

  if (!domain || !token) {
    throw new ShopifyError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_API_TOKEN.",
      500,
    );
  }

  // Accept either "store.myshopify.com" or a bare handle.
  const host = domain.includes(".") ? domain : `${domain}.myshopify.com`;
  return {
    url: `https://${host}/api/${version}/graphql.json`,
    token,
  };
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache,
  revalidate,
  tags,
}: ShopifyFetchOptions): Promise<T> {
  const { url, token } = getEndpoint();

  const nextOpts: { revalidate?: number | false; tags?: string[] } = {};
  if (revalidate !== undefined) nextOpts.revalidate = revalidate;
  if (tags) nextOpts.tags = tags;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      ...(cache ? { cache } : {}),
      ...(Object.keys(nextOpts).length ? { next: nextOpts } : {}),
    });
  } catch (err) {
    // Network-level failure (DNS, timeout). Callers decide how to degrade.
    throw new ShopifyError("Network error reaching Shopify", 503, err);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ShopifyError(`Shopify HTTP ${res.status}`, res.status, text);
  }

  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new ShopifyError("Shopify GraphQL error", 502, json.errors);
  }
  if (!json.data) {
    throw new ShopifyError("Shopify returned no data", 502, json);
  }
  return json.data;
}

// Shopify money amounts are decimal strings in MAJOR units ("24999.00").
// Our components work in INTEGER MINOR UNITS (paise). Convert carefully to
// avoid float drift on large jewelry prices.
export function toMinorUnits(amount: string): number {
  const [whole, frac = ""] = amount.split(".");
  const paise = `${whole}${(frac + "00").slice(0, 2)}`;
  return parseInt(paise, 10) || 0;
}
