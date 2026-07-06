"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Minus, Plus, MessageCircle, Mail } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useEcommerce } from "@/contexts/EcommerceContext";
import { formatPrice, cn } from "@/lib/utils";
import { gstLabel, gstFromInclusive } from "@/lib/india";
import PincodeChecker from "@/components/store/PincodeChecker";
import ProductCard from "@/components/store/ProductCard";

type Tab = "description" | "materials" | "shipping";

const TABS: { id: Tab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "materials", label: "Materials & Care" },
  { id: "shipping", label: "Delivery" },
];

interface LightboxProps {
  images: string[];
  initialIndex: number;
  name: string;
  onClose: () => void;
}

function Lightbox({ images, initialIndex, name, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 text-white/70 hover:text-white transition-colors p-2"
          aria-label="Previous image"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      <div
        className="relative w-full max-w-3xl mx-16 aspect-square"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`${name} — image ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 text-white/70 hover:text-white transition-colors p-2"
          aria-label="Next image"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {images.length > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-accent text-[10px] tracking-widest uppercase text-white/50">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  );
}

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
}

export default function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const { enabled: ecommerceEnabled, whatsappNumber } = useEcommerce();

  const images = product.images ?? [];
  const allImages: string[] = [];
  if (product.primaryImage) allImages.push(product.primaryImage);
  images.forEach((img) => { if (img !== product.primaryImage) allImages.push(img); });
  if (allImages.length === 0 && images.length > 0) allImages.push(...images);

  const [mainIndex, setMainIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("description");
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { add, loading } = useCart();

  const hasVariants = product.variants.length > 1;
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.defaultVariantId ?? product.variants[0]?.id ?? null,
  );
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;

  const price = selectedVariant?.price ?? product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const qtyAvailable = selectedVariant?.quantityAvailable ?? null;
  const maxStock = qtyAvailable ?? 99;
  const isOutOfStock = !product.available || (selectedVariant ? !selectedVariant.available : true);

  function selectImage(idx: number) {
    if (idx === mainIndex) return;
    setPrevIndex(mainIndex);
    setMainIndex(idx);
    setTimeout(() => setPrevIndex(null), 500);
  }

  function handleAddToCart() {
    if (isOutOfStock || !selectedVariantId) return;
    add(selectedVariantId, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }
  function increment() {
    setQuantity((q) => Math.min(maxStock, q + 1));
  }

  const stockLabel = isOutOfStock
    ? "Out of Stock"
    : qtyAvailable !== null && qtyAvailable <= 3
    ? `Only ${qtyAvailable} left`
    : "Available";

  const stockColor = isOutOfStock
    ? "text-destructive"
    : qtyAvailable !== null && qtyAvailable <= 3
    ? "text-primary"
    : "text-foreground/60";

  const whatsappMessage = encodeURIComponent(
    `Namaste! I came across "${product.name}" on EZMAY By Gurleen and I'm interested in learning more. Could you please share details about availability and pricing?`
  );
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${whatsappMessage}`
    : null;

  return (
    <>
      <div className="max-w-[1320px] mx-auto px-6 py-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Left — image gallery */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div
              className="relative aspect-square bg-secondary overflow-hidden cursor-zoom-in"
              onClick={() => allImages.length > 0 && setLightboxOpen(true)}
            >
              {allImages.length > 0 ? (
                <>
                  <Image
                    key={mainIndex}
                    src={allImages[mainIndex]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-cover transition-opacity duration-500"
                  />
                  {prevIndex !== null && (
                    <Image
                      src={allImages[prevIndex]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover opacity-0 transition-opacity duration-500 absolute inset-0"
                    />
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-accent text-xs tracking-widest uppercase text-muted">
                    No Image
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => selectImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      "relative shrink-0 size-16 overflow-hidden border-2 transition-colors",
                      i === mainIndex ? "border-primary" : "border-transparent"
                    )}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — product info */}
          <div className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-8">
            {/* Eyebrow + name */}
            <div className="flex flex-col gap-3">
              {product.category && (
                <p className="font-accent text-xs tracking-widest uppercase text-muted">
                  {product.category}
                </p>
              )}
              <h1 className="font-display text-4xl md:text-5xl leading-tight text-foreground">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-display text-3xl text-primary">
                  {formatPrice(price)}
                </span>
                {compareAtPrice && compareAtPrice > price && (
                  <span className="font-body text-lg text-muted line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                )}
                {compareAtPrice && compareAtPrice > price && (
                  <span className="font-accent text-[10px] tracking-widest uppercase text-primary border border-primary px-2 py-0.5">
                    Sale
                  </span>
                )}
              </div>
              {/* GST transparency — jewelry prices are shown inclusive of GST */}
              <p className="font-body text-xs text-muted">
                Inclusive of {gstLabel()} · {formatPrice(gstFromInclusive(price))} tax
              </p>
            </div>

            {/* Variant selector */}
            {hasVariants && (
              <div className="flex flex-col gap-3">
                <p className="font-accent text-[10px] tracking-widest uppercase text-muted">
                  Options
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariantId(v.id); setQuantity(1); }}
                      disabled={!v.available}
                      className={cn(
                        "px-4 py-2 font-body text-sm border transition-colors",
                        v.id === selectedVariantId
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground hover:border-foreground",
                        !v.available && "opacity-40 line-through cursor-not-allowed"
                      )}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <p className={cn("font-body text-sm flex items-center gap-2", stockColor)}>
              <span
                className={cn(
                  "inline-block size-2 rounded-full",
                  isOutOfStock
                    ? "bg-destructive"
                    : qtyAvailable !== null && qtyAvailable <= 3
                    ? "bg-primary"
                    : "bg-green-500"
                )}
              />
              {stockLabel}
            </p>

            {/* CTA — e-commerce on: Add to Cart | e-commerce off: Enquire */}
            <div className="flex flex-col gap-4">
              {ecommerceEnabled ? (
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-border">
                    <button
                      onClick={decrement}
                      disabled={quantity <= 1 || isOutOfStock}
                      aria-label="Decrease quantity"
                      className="px-4 py-3 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-5 py-3 font-body text-sm font-medium w-12 text-center tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={increment}
                      disabled={quantity >= maxStock || isOutOfStock}
                      aria-label="Increase quantity"
                      className="px-4 py-3 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || loading}
                    className={cn(
                      "flex-1 py-3.5 font-accent text-xs tracking-[0.2em] uppercase transition-colors duration-300",
                      isOutOfStock
                        ? "bg-muted/20 text-muted cursor-not-allowed"
                        : addedFeedback
                        ? "bg-primary text-white"
                        : "bg-foreground text-background hover:bg-primary"
                    )}
                  >
                    {isOutOfStock ? "Out of Stock" : addedFeedback ? "Added to Cart" : loading ? "Adding…" : "Add to Cart"}
                  </button>
                </div>
              ) : (
                /* Enquiry mode — e-commerce not yet enabled */
                <div className="flex flex-col gap-3">
                  {whatsappLink ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] text-white font-accent text-xs tracking-[0.2em] uppercase hover:bg-[#20b958] transition-colors duration-300"
                    >
                      <MessageCircle size={16} />
                      Enquire on WhatsApp
                    </a>
                  ) : (
                    <a
                      href={`mailto:?subject=Enquiry about ${encodeURIComponent(product.name)} — EZMAY By Gurleen&body=${encodeURIComponent(`Hello,\n\nI am interested in "${product.name}" from EZMAY By Gurleen. Could you please share more details?\n\nThank you.`)}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase hover:bg-primary transition-colors duration-300"
                    >
                      <Mail size={16} />
                      Send Enquiry
                    </a>
                  )}
                  <p className="font-body text-xs text-muted text-center">
                    Online shopping coming soon — enquire to learn more about this piece
                  </p>
                </div>
              )}

              {/* Pincode serviceability + ETA (pre-checkout, powered by Shiprocket) */}
              {ecommerceEnabled && (
                <div className="pt-2">
                  <PincodeChecker />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Tabs */}
            <div className="flex flex-col gap-6">
              <div className="flex border-b border-border">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "font-accent text-[10px] tracking-widest uppercase pb-3 mr-6 border-b-2 transition-colors",
                      tab === t.id
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="font-body text-sm text-muted leading-relaxed">
                {tab === "description" && (
                  <p>{product.description || "No description available."}</p>
                )}
                {tab === "materials" && (
                  <div className="flex flex-col gap-4">
                    {product.material && (
                      <p>
                        <strong className="text-foreground font-medium">Material:</strong>{" "}
                        {product.material}
                      </p>
                    )}
                    <p>
                      Each EZMAY piece is handcrafted using traditional Indian techniques and
                      ethically sourced materials. To preserve your jewelry, keep it away from
                      perfume, water, and direct sunlight. Store in the provided cloth pouch
                      when not in use.
                    </p>
                  </div>
                )}
                {tab === "shipping" && (
                  <div className="flex flex-col gap-3">
                    {ecommerceEnabled ? (
                      <>
                        <p>
                          <strong className="text-foreground font-medium">Standard:</strong>{" "}
                          5–7 business days across India — Free on orders above ₹5,000
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">Express:</strong>{" "}
                          2–3 business days — ₹299
                        </p>
                        <p>All orders ship from New Delhi in our signature packaging. Returns accepted within 30 days.</p>
                      </>
                    ) : (
                      <p>
                        For delivery and shipping information, please enquire directly via
                        WhatsApp or email. We deliver across India and internationally.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Meta */}
            {product.material && (
              <div className="flex flex-col gap-2 text-sm font-body pt-2">
                <div className="flex gap-2">
                  <span className="text-muted w-24 shrink-0">Material</span>
                  <span className="text-foreground">{product.material}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted w-24 shrink-0">Origin</span>
                  <span className="text-foreground">Handcrafted in New Delhi, India</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-border">
            <h2 className="font-display text-3xl text-foreground mb-12 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <Lightbox
          images={allImages}
          initialIndex={mainIndex}
          name={product.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
