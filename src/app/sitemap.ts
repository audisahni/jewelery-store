import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://jewelrystore.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/shop?category=rings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop?category=necklaces`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop?category=earrings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop?category=bracelets`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Try to fetch products for dynamic pages
  try {
    const res = await fetch(`${BASE_URL}/api/products`, { cache: "no-store" });
    if (res.ok) {
      const products = await res.json();
      const productPages: MetadataRoute.Sitemap = products
        .filter((p: any) => p.active)
        .map((p: any) => ({
          url: `${BASE_URL}/shop/${p.slug}`,
          lastModified: new Date(p.updatedAt || p.createdAt),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      return [...staticPages, ...productPages];
    }
  } catch {}

  return staticPages;
}
