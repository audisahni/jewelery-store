import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { products, orders, settings } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function getProducts(opts?: {
  featured?: boolean;
  category?: string;
  slug?: string;
  activeOnly?: boolean;
}) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    let result = await db.select().from(products).orderBy(desc(products.createdAt));
    if (opts?.activeOnly !== false) result = result.filter((p) => !!p.active);
    if (opts?.featured) result = result.filter((p) => !!p.featured);
    if (opts?.category) result = result.filter((p) => p.category === opts.category);
    if (opts?.slug) result = result.filter((p) => p.slug === opts.slug);
    return result;
  } catch {
    return [];
  }
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
