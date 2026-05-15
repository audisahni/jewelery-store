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
import { formatPrice, cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 50000; // $500 in cents

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const sub = subtotal();
  const remaining = FREE_SHIPPING_THRESHOLD - sub;
  const hasFreeShipping = sub >= FREE_SHIPPING_THRESHOLD;

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
            {items.length > 0 && (
              <span className="size-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-body font-medium">
                {items.reduce((s, i) => s + i.quantity, 0)}
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

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-12 text-center">
            <ShoppingBag size={40} strokeWidth={1} className="text-muted" />
            <div className="flex flex-col gap-2">
              <p className="font-display text-2xl text-foreground">Your cart is empty</p>
              <p className="font-body text-sm text-muted">
                Discover our collection of handcrafted fine jewelry.
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-2"
            >
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
                {items.map((item) => {
                  const images = Array.isArray(item.product.images)
                    ? (item.product.images as string[])
                    : [];
                  const imgSrc = item.product.primaryImage ?? images[0] ?? null;
                  const maxStock = item.product.stock ?? 99;

                  return (
                    <li key={item.product.id} className="flex gap-4 px-6 py-5">
                      {/* Image */}
                      <div className="relative size-[72px] shrink-0 bg-secondary overflow-hidden">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={item.product.name}
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
                            href={`/shop/${item.product.slug}`}
                            onClick={() => onOpenChange(false)}
                            className="font-display text-base leading-snug text-foreground hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            aria-label={`Remove ${item.product.name}`}
                            className="shrink-0 text-muted hover:text-foreground transition-colors p-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {item.product.material && (
                          <p className="font-body text-xs text-muted">{item.product.material}</p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-1">
                          {/* Quantity */}
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="px-2.5 py-1.5 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 py-1.5 font-body text-sm tabular-nums w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="px-2.5 py-1.5 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                              disabled={item.quantity >= maxStock}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Line price */}
                          <span className="font-display text-lg text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
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
                Taxes and shipping calculated at checkout
              </p>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-center gap-3 w-full bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary transition-colors duration-300"
              >
                Continue to Checkout
                <span className="w-5 h-px bg-current" aria-hidden />
              </Link>

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
