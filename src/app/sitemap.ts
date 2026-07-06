import { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";

const BASE_URL = process.env.NEXTAUTH_URL || "https://jewelrystore.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/shop?category=rings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop?category=necklaces`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop?category=earrings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop?category=bracelets`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Product pages from the Shopify catalog. getProducts degrades to [] if Shopify
  // is unreachable, so the sitemap always returns at least the static pages.
  const products = await getProducts({ activeOnly: true });
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
