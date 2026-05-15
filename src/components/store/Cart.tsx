"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 50000; // $500 in cents
const SHIPPING_COST = 1500; // $15

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const sub = subtotal();
  const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = sub + shipping;
  const remaining = FREE_SHIPPING_THRESHOLD - sub;
  const hasFreeShipping = sub >= FREE_SHIPPING_THRESHOLD;

  if (items.length === 0) {
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
        <button
          onClick={clearCart}
          className="font-accent text-[10px] tracking-widest uppercase text-muted hover:text-foreground transition-colors"
        >
          Clear cart
        </button>
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
            {items.map((item) => {
              const images = Array.isArray(item.product.images)
                ? (item.product.images as string[])
                : [];
              const imgSrc = item.product.primaryImage ?? images[0] ?? null;
              const maxStock = item.product.stock ?? 99;
              const linePrice = item.product.price * item.quantity;

              return (
                <li
                  key={item.product.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 sm:gap-6 py-6 items-start sm:items-center"
                >
                  {/* Product info */}
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative size-20 shrink-0 bg-secondary overflow-hidden">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={item.product.name}
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
                      {item.product.category && (
                        <p className="font-accent text-[10px] tracking-widest uppercase text-muted">
                          {item.product.category}
                        </p>
                      )}
                      <Link
                        href={`/shop/${item.product.slug}`}
                        className="font-display text-xl leading-snug text-foreground hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.material && (
                        <p className="font-body text-sm text-muted">{item.product.material}</p>
                      )}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        aria-label={`Remove ${item.product.name}`}
                        className="flex items-center gap-1 font-accent text-[10px] tracking-widest uppercase text-muted hover:text-foreground transition-colors mt-2 w-fit"
                      >
                        <X size={10} />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border border-border w-fit sm:mx-auto">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      disabled={item.quantity <= 1}
                      className="px-3 py-2.5 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-4 py-2.5 font-body text-sm tabular-nums w-10 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      disabled={item.quantity >= maxStock}
                      className="px-3 py-2.5 text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Line price */}
                  <span className="font-display text-2xl text-primary sm:text-right sm:w-24">
                    {formatPrice(linePrice)}
                  </span>
                </li>
              );
            })}
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
                  Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                </span>
                <span className="text-foreground">{formatPrice(sub)}</span>
              </div>

              <div className="flex justify-between font-body text-sm">
                <span className="text-muted">Shipping</span>
                <span className={cn("text-foreground", hasFreeShipping && "text-primary")}>
                  {hasFreeShipping ? "Free" : formatPrice(SHIPPING_COST)}
                </span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex justify-between">
                <span className="font-body text-sm text-foreground font-medium">Total</span>
                <span className="font-display text-2xl text-primary">{formatPrice(total)}</span>
              </div>

              <p className="font-body text-xs text-muted">Taxes calculated at checkout</p>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-3 w-full bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary transition-colors duration-300"
            >
              Proceed to Checkout
              <span className="w-5 h-px bg-current" aria-hidden />
            </Link>

            {/* Trust signals */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {[
                "Free returns within 30 days",
                "Secure payment",
                "Complimentary gift packaging",
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
