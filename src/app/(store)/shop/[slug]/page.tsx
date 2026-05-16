import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/store/ProductDetail";
import ProductCard from "@/components/store/ProductCard";
import { getProducts } from "@/lib/data";

async function getProduct(slug: string) {
  const results = await getProducts({ slug, activeOnly: false });
  return results[0] ?? null;
}

async function getRelatedProducts(category: string, excludeId: string) {
  const results = await getProducts({ category, activeOnly: true });
  return results.filter((p) => p.id !== excludeId).slice(0, 4);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const storeName = "Lumière";
  const title = product.metaTitle || `${product.name} | ${storeName}`;
  const description =
    product.metaDescription ||
    (product.description ? product.description.slice(0, 155) : `Shop ${product.name} at ${storeName}.`);
  const image = product.primaryImage || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL || "https://jewelrystore.com"}/shop/${slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const relatedProducts = product.category
    ? await getRelatedProducts(product.category, product.id)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: Array.isArray(product.images) ? product.images : [product.primaryImage].filter(Boolean),
    sku: product.id,
    offers: {
      "@type": "Offer",
      price: product.price / 100,
      priceCurrency: "USD",
      availability:
        (product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXTAUTH_URL || "https://jewelrystore.com"}/shop/${product.slug}`,
    },
    ...(product.material && { material: product.material }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-16">
        <ProductDetail product={product} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-[120px] px-6 border-t border-border">
            <div className="max-w-[1320px] mx-auto">
              <div className="text-center mb-12">
                <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-3">You may also like</p>
                <h2 className="font-display text-4xl text-foreground">Related Pieces</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
