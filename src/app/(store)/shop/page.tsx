import { Metadata } from "next";
import ProductGrid from "@/components/store/ProductGrid";

export const metadata: Metadata = {
  title: "Shop Fine Jewelry | Lumière",
  description: "Browse our complete collection of handcrafted fine jewelry. Rings, necklaces, earrings, and bracelets.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;

  // Fetch initial products server-side
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  let products = [];
  try {
    const url = new URL(`${baseUrl}/api/products`);
    if (params.category) url.searchParams.set("category", params.category);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (res.ok) products = await res.json();
  } catch {}

  const categoryLabel = params.category
    ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
    : "All Jewelry";

  return (
    <div className="pt-24 pb-[120px]">
      {/* Header */}
      <div className="bg-secondary py-16 px-6">
        <div className="max-w-[1320px] mx-auto">
          <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-3">
            {params.category ? `Collections / ${params.category}` : "Collections"}
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground">{categoryLabel}</h1>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 mt-12">
        <div className="max-w-[1320px] mx-auto">
          <ProductGrid initialProducts={products} initialCategory={params.category} />
        </div>
      </div>
    </div>
  );
}
