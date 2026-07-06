"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

// Checkout is handled by Shopify's hosted, PCI-compliant checkout (payments via
// Razorpay/UPI/EMI, GST, and shipping all configured Shopify-side). This route
// exists only as a safe redirector: it forwards to the current cart's
// checkoutUrl, or back to the cart if there's nothing to check out.
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refresh } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refresh();
      if (cancelled) return;
      const url = useCart.getState().cart?.checkoutUrl;
      if (url) window.location.href = url;
      else router.replace("/cart");
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pt-24 pb-[120px] px-6 min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
      <Loader2 size={28} className="animate-spin text-primary" />
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-foreground">Taking you to secure checkout…</h1>
        <p className="font-body text-sm text-muted">
          {cart?.checkoutUrl ? "Redirecting to Shopify checkout." : "Preparing your order."}
        </p>
      </div>
    </div>
  );
}
