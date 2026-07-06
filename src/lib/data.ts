import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { orders, settings } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import {
  getProducts as shopifyGetProducts,
  getProduct as shopifyGetProduct,
} from "@/lib/shopify";
import type { StoreProduct } from "@/lib/shopify/types";

// Catalog reads come from Shopify. This adapter preserves the previous call-site
// signature so store pages need no changes. `activeOnly` is a no-op: Shopify's
// storefront query already filters to `available_for_sale:true` for listings,
// while single-handle lookups return the product regardless.
export async function getProducts(opts?: {
  featured?: boolean;
  category?: string;
  slug?: string;
  activeOnly?: boolean;
}): Promise<StoreProduct[]> {
  if (opts?.slug) {
    const product = await shopifyGetProduct(opts.slug);
    return product ? [product] : [];
  }
  return shopifyGetProducts({ featured: opts?.featured, category: opts?.category });
}

export async function getOrders() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch {
    return [];
  }
}

export async function getStoreSettings() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const all = await db.select().from(settings);
    return all.reduce(
      (acc, s) => {
        if (s.key && s.value) acc[s.key] = s.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  } catch {
    return {};
  }
}
