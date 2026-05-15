"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { formatPrice, cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

function StockBadge({ stock }: { stock: number | null }) {
  if (stock === null) return null;
  if (stock === 0) {
    return (
      <span className="font-accent text-[9px] tracking-widest uppercase bg-foreground text-background px-2 py-1">
        Out of Stock
      </span>
    );
  }
  if (stock <= 3) {
    return (
      <span className="font-accent text-[9px] tracking-widest uppercase bg-background/90 text-foreground border border-border px-2 py-1">
        Only {stock} left
      </span>
    );
  }
  return null;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { addItem } = useCart();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const primarySrc = product.primaryImage ?? images[0] ?? null;
  const hoverSrc = images.length >= 2 ? images[1] : null;

  const isOutOfStock = product.stock !== null && product.stock === 0;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  }

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn("product-card group block", isOutOfStock && "opacity-75")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {primarySrc ? (
          <>
            <Image
              src={primarySrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={cn(
                "object-cover transition-opacity duration-500",
                hovered && hoverSrc ? "opacity-0" : "opacity-100"
              )}
            />
            {hoverSrc && (
              <Image
                src={hoverSrc}
                alt={`${product.name} — alternate view`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={cn(
                  "object-cover transition-opacity duration-500 absolute inset-0",
                  hovered ? "opacity-100" : "opacity-0"
                )}
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

        {/* Stock badge — top-left */}
        <div className="absolute top-3 left-3">
          <StockBadge stock={product.stock} />
        </div>

        {/* Quick add button — slides up on hover */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 transition-all duration-300",
            hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}
        >
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            aria-label={`Quick add ${product.name} to cart`}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 font-accent text-[10px] tracking-[0.2em] uppercase transition-colors duration-200",
              isOutOfStock
                ? "bg-muted/30 text-muted cursor-not-allowed"
                : addedFeedback
                ? "bg-primary text-white"
                : "bg-background/95 text-foreground hover:bg-primary hover:text-white"
            )}
          >
            <ShoppingBag size={12} />
            {addedFeedback ? "Added" : isOutOfStock ? "Out of Stock" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="pt-4 flex flex-col gap-1">
        {product.category && (
          <p className="font-accent text-[10px] tracking-widest uppercase text-muted">
            {product.category}
          </p>
        )}
        <h3 className="font-display text-lg leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>
        {product.material && (
          <p className="font-body text-sm text-muted">{product.material}</p>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display text-xl text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="font-body text-sm text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
