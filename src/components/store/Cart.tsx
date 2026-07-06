"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, cn } from "@/lib/utils";
import { gstLabel } from "@/lib/india";

const FREE_SHIPPING_THRESHOLD = 500000; // ₹5,000 in paise (marketing nudge only)

export default function Cart() {
  const { cart, setQuantity, remove, checkout, loading } = useCart();
  const lines = cart?.lines ?? [];
  const sub = cart?.subtotal ?? 0;
  const totalQty = cart?.totalQuantity ?? 0;
  const remaining = FREE_SHIPPING_THRESHOLD - sub;
  const hasFreeShipping = sub >= FREE_SHIPPING_THRESHOLD;

  if (lines.length === 0) {
    return (
      <div className="max-w-[1320px] mx-auto px-6 py-[120px] flex flex-col items-center justify-center gap-8 text-center min-h-[60vh]">
        <ShoppingBag size={48} strokeWidth={1} className="text-muted" />
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-4xl text-foreground">Your cart is empty</h1>
          <p className="font-body text-base text-muted max-w-sm mx-auto">
            You haven&apos;t added anything yet. Explore our collection to find your perfect piece.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-3 bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Shop the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-6 py-[120px]">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-12 pb-6 border-b border-border">
        <h1 className="font-display text-4xl text-foreground">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        {/* Items column */}
        <div className="flex flex-col">
          {/* Free shipping progress */}
          <div
            className={cn(
              "mb-8 p-4 border",
              hasFreeShipping ? "border-primary/30 bg-primary/5" : "border-border bg-secondary"
            )}
          >
            {hasFreeShipping ? (
              <p className="font-accent text-[10px] tracking-widest uppercase text-primary">
                Your order qualifies for free shipping
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="font-accent text-[10px] tracking-widest uppercase text-muted">
                  Add {formatPrice(remaining)} more for free shipping
                </p>
                <div className="w-full h-0.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, (sub / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Column headers — desktop */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-6 pb-4 border-b border-border mb-2">
            <span className="font-accent text-[10px] tracking-widest uppercase text-muted">Product</span>
            <span className="font-accent text-[10px] tracking-widest uppercase text-muted w-28 text-center">Quantity</span>
            <span className="font-accent text-[10px] tracking-widest uppercase text-muted w-24 text-right">Price</span>
          </div>

          {/* Items */}
          <ul className="divide-y divide-border">
            {lines.map((line) => (
              <li
                key={line.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 sm:gap-6 py-6 items-start sm:items-center"
              >
                {/* Product info */}
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative size-20 shrink-0 bg-secondary overflow-hidden">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag size={20} strokeWidth={1} className="text-muted" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <Link
                      href={`/shop/${line.slug}`}
                      className="font-display text-xl leading-snug text-foreground hover:text-primary transition-colors"
                    >
                      {line.name}
                    </Link>
                    {line.variantTitle && line.variantTitle !== "Default Title" && (
                      <p className="font-body text-sm text-muted">{line.variantTitle}</p>
                    )}
                    <button
                      onClick={() => remove(line.id)}
                      disabled={loading}
                      aria-label={`Remove ${line.name}`}
                      className="flex items-center gap-1 font-accent text-[10px] tracking-widest uppercase text-muted hover:text-foreground transition-colors mt-2 w-fit disabled:opacity-40"
                    >
                      <X size={10} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-border w-fit sm:mx-auto">
                  <button
                    onClick={() => setQuantity(line.id, line.quantity - 1)}
                    aria-label="Decrease quantity"
                    disabled={loading}
                    className="px-3 py-2.5 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-4 py-2.5 font-body text-sm tabular-nums w-10 text-center">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(line.id, line.quantity + 1)}
                    aria-label="Increase quantity"
                    disabled={loading}
                    className="px-3 py-2.5 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Line price */}
                <span className="font-display text-2xl text-primary sm:text-right sm:w-24">
                  {formatPrice(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          {/* Continue shopping */}
          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-accent text-xs tracking-widest uppercase text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-border p-6 flex flex-col gap-5">
            <h2 className="font-display text-2xl text-foreground">Order Summary</h2>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted">
                  Subtotal ({totalQty} item{totalQty !== 1 ? "s" : ""})
                </span>
                <span className="text-foreground">{formatPrice(sub)}</span>
              </div>

              <div className="flex justify-between font-body text-sm">
                <span className="text-muted">Shipping</span>
                <span className="text-foreground">Calculated at checkout</span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex justify-between">
                <span className="font-body text-sm text-foreground font-medium">Total</span>
                <span className="font-display text-2xl text-primary">{formatPrice(sub)}</span>
              </div>

              <p className="font-body text-xs text-muted">
                Incl. {gstLabel()}. Final shipping &amp; taxes shown at checkout.
              </p>
            </div>

            <button
              onClick={checkout}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary transition-colors duration-300 disabled:opacity-50"
            >
              Proceed to Checkout
              <span className="w-5 h-px bg-current" aria-hidden />
            </button>

            {/* Trust signals */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {[
                "Secure Shopify checkout",
                "UPI, cards & EMI supported",
                "Free returns within 30 days",
              ].map((signal) => (
                <p key={signal} className="font-body text-xs text-muted flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  {signal}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
