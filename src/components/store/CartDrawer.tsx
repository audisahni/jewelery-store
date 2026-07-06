"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { gstLabel } from "@/lib/india";

const FREE_SHIPPING_THRESHOLD = 500000; // ₹5,000 in paise (marketing nudge only)

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, setQuantity, remove, checkout, loading } = useCart();
  const lines = cart?.lines ?? [];
  const sub = cart?.subtotal ?? 0;
  const remaining = FREE_SHIPPING_THRESHOLD - sub;
  const hasFreeShipping = sub >= FREE_SHIPPING_THRESHOLD;
  const totalQty = cart?.totalQuantity ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[400px] flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <SheetTitle className="font-display text-xl tracking-tight">
              Your Cart
            </SheetTitle>
            {totalQty > 0 && (
              <span className="size-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-body font-medium">
                {totalQty}
              </span>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close cart"
            className="p-1.5 text-muted hover:text-foreground transition-colors rounded-sm"
          >
            <X size={18} />
          </button>
        </SheetHeader>

        {lines.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-12 text-center">
            <ShoppingBag size={40} strokeWidth={1} className="text-muted" />
            <div className="flex flex-col gap-2">
              <p className="font-display text-2xl text-foreground">Your cart is empty</p>
              <p className="font-body text-sm text-muted">
                Discover our collection of handcrafted fine jewelry.
              </p>
            </div>
            <button onClick={() => onOpenChange(false)} className="mt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-primary transition-colors"
              >
                Shop Now
              </Link>
            </button>
          </div>
        ) : (
          <>
            {/* Free shipping bar */}
            <div className="px-6 py-3 bg-secondary border-b border-border">
              {hasFreeShipping ? (
                <p className="font-accent text-[10px] tracking-widest uppercase text-primary text-center">
                  You qualify for free shipping
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <p className="font-accent text-[10px] tracking-widest uppercase text-muted text-center">
                    Add {formatPrice(remaining)} for free shipping
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

            {/* Items list */}
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-border">
                {lines.map((line) => (
                  <li key={line.id} className="flex gap-4 px-6 py-5">
                    {/* Image */}
                    <div className="relative size-[72px] shrink-0 bg-secondary overflow-hidden">
                      {line.image ? (
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag size={20} strokeWidth={1} className="text-muted" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/shop/${line.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="font-display text-base leading-snug text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {line.name}
                        </Link>
                        <button
                          onClick={() => remove(line.id)}
                          disabled={loading}
                          aria-label={`Remove ${line.name}`}
                          className="shrink-0 text-muted hover:text-foreground transition-colors p-0.5 disabled:opacity-40"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {line.variantTitle && line.variantTitle !== "Default Title" && (
                        <p className="font-body text-xs text-muted">{line.variantTitle}</p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-1">
                        {/* Quantity */}
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => setQuantity(line.id, line.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="px-2.5 py-1.5 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                            disabled={loading}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 py-1.5 font-body text-sm tabular-nums w-8 text-center">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(line.id, line.quantity + 1)}
                            aria-label="Increase quantity"
                            className="px-2.5 py-1.5 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                            disabled={loading}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Line price */}
                        <span className="font-display text-lg text-primary">
                          {formatPrice(line.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-6 flex flex-col gap-4 bg-background">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-muted">Subtotal</span>
                <span className="font-display text-xl text-foreground">
                  {formatPrice(sub)}
                </span>
              </div>
              <p className="font-body text-xs text-muted">
                Incl. {gstLabel()}. Shipping calculated at checkout.
              </p>

              {/* Checkout CTA — hands off to Shopify's secure checkout */}
              <button
                onClick={() => { onOpenChange(false); checkout(); }}
                disabled={loading || lines.length === 0}
                className="flex items-center justify-center gap-3 w-full bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary transition-colors duration-300 disabled:opacity-50"
              >
                Continue to Checkout
                <span className="w-5 h-px bg-current" aria-hidden />
              </button>

              {/* Continue shopping */}
              <button
                onClick={() => onOpenChange(false)}
                className="font-accent text-[10px] tracking-widest uppercase text-muted hover:text-foreground transition-colors text-center py-1"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
