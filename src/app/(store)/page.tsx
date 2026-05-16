import Hero from "@/components/store/Hero";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/data";

const CATEGORIES = [
  { name: "Rings", slug: "rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80" },
  { name: "Necklaces", slug: "necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80" },
  { name: "Earrings", slug: "earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80" },
  { name: "Bracelets", slug: "bracelets", image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80" },
];

async function getFeaturedProducts() {
  return getProducts({ featured: true, activeOnly: true });
}

function NewsletterSection() {
  return (
    <section className="py-[120px] px-6 bg-foreground text-background">
      <div className="max-w-[560px] mx-auto text-center">
        <p className="font-accent text-xs tracking-[0.3em] uppercase text-background/60 mb-4">Stay Connected</p>
        <h2 className="font-display text-4xl md:text-5xl text-background mb-4">
          First to Know
        </h2>
        <p className="font-body text-sm text-background/70 mb-10">
          Receive invitations to private previews, new arrivals, and stories from the atelier.
        </p>
        <form action="#" method="POST" className="flex gap-0">
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            required
            className="flex-1 bg-background/10 border border-background/20 text-background placeholder:text-background/40 px-5 py-3 text-sm font-body outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="bg-primary text-white font-accent text-xs tracking-widest uppercase px-8 py-3 hover:bg-primary/80 transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <Hero />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-[120px] px-6 bg-background">
          <div className="max-w-[1320px] mx-auto">
            <div className="text-center mb-16">
              <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-4">Handpicked for you</p>
              <h2 className="font-display text-5xl md:text-6xl text-foreground">Featured Pieces</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 border border-foreground text-foreground font-accent text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-foreground hover:text-background transition-colors duration-300"
              >
                View All Jewelry
                <span className="w-6 h-px bg-current" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section className="py-[120px] px-6 bg-secondary">
        <div className="max-w-[1320px] mx-auto">
          <div className="text-center mb-16">
            <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-4">Shop by Category</p>
            <h2 className="font-display text-5xl md:text-6xl text-foreground">Collections</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group relative aspect-square overflow-hidden"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-background">
                    <p className="font-accent text-xs tracking-[0.3em] uppercase opacity-80 mb-1">Explore</p>
                    <h3 className="font-display text-3xl">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-[120px] px-6 bg-background">
        <div className="max-w-[640px] mx-auto text-center">
          <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-8">Our Story</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-8">
            Crafted with Intention
          </h2>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="font-body text-base text-muted leading-relaxed mb-6">
            Every piece in our collection begins as a vision — a conversation between ancient craft and modern sensibility. We work with master goldsmiths and source only certified, ethically obtained gemstones.
          </p>
          <p className="font-body text-base text-muted leading-relaxed">
            From initial sketch to final polish, each jewel undergoes over 40 hours of artisanal attention. We believe that fine jewelry is not merely an accessory — it is a story worn close to the skin, a heirloom in the making.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 mt-12 font-accent text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors duration-200"
          >
            Discover the Collection
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}
