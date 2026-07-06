import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoreCart } from "@/lib/shopify/types";
import { toast } from "sonner";

// Shopify-backed cart. We persist only the Shopify cart id + a snapshot of the
// last-known cart for instant paint; the server (via /api/cart) is the source of
// truth. All mutations return the full cart, which we swap in atomically.

interface CartState {
  cartId: string | null;
  cart: StoreCart | null;
  isOpen: boolean;
  loading: boolean;
  setOpen: (open: boolean) => void;
  refresh: () => Promise<void>;
  add: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  checkout: () => void;
  count: () => number;
  subtotal: () => number;
}

async function cartRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>,
  query?: string,
): Promise<{ cart: StoreCart | null } | { error: string }> {
  const res = await fetch(`/api/cart${query ?? ""}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      cart: null,
      isOpen: false,
      loading: false,

      setOpen: (open) => set({ isOpen: open }),

      // Reconcile the persisted cart with Shopify (prices/availability may have
      // changed since last visit). Silently clears a cart Shopify has expired.
      refresh: async () => {
        const { cartId } = get();
        if (!cartId) return;
        try {
          const data = await cartRequest("GET", undefined, `?id=${encodeURIComponent(cartId)}`);
          if ("cart" in data) {
            if (data.cart) set({ cart: data.cart });
            else set({ cartId: null, cart: null }); // expired server-side
          }
        } catch {
          /* keep snapshot on transient network error */
        }
      },

      add: async (variantId, quantity = 1) => {
        set({ loading: true });
        try {
          const data = await cartRequest("POST", { variantId, quantity, cartId: get().cartId });
          if ("error" in data) throw new Error(data.error);
          if (data.cart) set({ cart: data.cart, cartId: data.cart.id, isOpen: true });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Couldn't add to cart");
        } finally {
          set({ loading: false });
        }
      },

      setQuantity: async (lineId, quantity) => {
        const { cartId } = get();
        if (!cartId) return;
        set({ loading: true });
        try {
          const data = await cartRequest("PATCH", { cartId, lineId, quantity });
          if ("error" in data) throw new Error(data.error);
          if (data.cart) set({ cart: data.cart });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Couldn't update cart");
        } finally {
          set({ loading: false });
        }
      },

      remove: async (lineId) => {
        const { cartId } = get();
        if (!cartId) return;
        set({ loading: true });
        try {
          const data = await cartRequest("DELETE", { cartId, lineId });
          if ("error" in data) throw new Error(data.error);
          if (data.cart) set({ cart: data.cart });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Couldn't remove item");
        } finally {
          set({ loading: false });
        }
      },

      // Hand off to Shopify's hosted checkout (payments, GST, shipping live there).
      checkout: () => {
        const url = get().cart?.checkoutUrl;
        if (url) window.location.href = url;
        else toast.error("Your cart is empty");
      },

      count: () => get().cart?.totalQuantity ?? 0,
      subtotal: () => get().cart?.subtotal ?? 0,
    }),
    {
      name: "cart-storage",
      // Persist only what we need to rehydrate; never persist transient UI state.
      partialize: (s) => ({ cartId: s.cartId, cart: s.cart }),
    },
  ),
);
