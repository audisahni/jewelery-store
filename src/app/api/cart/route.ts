import { NextResponse } from "next/server";
import {
  getCart,
  createCart,
  addToCart,
  updateCartLine,
  removeCartLine,
} from "@/lib/shopify";
import { ShopifyError } from "@/lib/shopify/client";

// Proxies Shopify Cart operations so the Storefront token stays server-side and
// requests run on the edge close to the user. Always returns the full
// normalized StoreCart (or null) so the client can replace its state atomically.

function fail(err: unknown) {
  const status = err instanceof ShopifyError ? err.status : 500;
  const message =
    err instanceof ShopifyError && status === 400
      ? err.message // user errors (e.g. sold out) are safe to surface
      : "Cart is temporarily unavailable. Please try again.";
  console.error("cart route error:", err);
  return NextResponse.json({ error: message }, { status });
}

// GET /api/cart?id=<cartId> -> fetch current cart
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ cart: null });
  try {
    const cart = await getCart(id);
    return NextResponse.json({ cart });
  } catch (err) {
    return fail(err);
  }
}

// POST { variantId, quantity, cartId? } -> add line (creating the cart if needed)
export async function POST(req: Request) {
  try {
    const { variantId, quantity = 1, cartId } = (await req.json()) as {
      variantId?: string;
      quantity?: number;
      cartId?: string;
    };
    if (!variantId) {
      return NextResponse.json({ error: "variantId required" }, { status: 400 });
    }
    const lines = [{ merchandiseId: variantId, quantity }];

    // If we have a cartId, try to add to it; if that cart expired (Shopify carts
    // are ephemeral), fall back to creating a fresh cart so the add still works.
    if (cartId) {
      try {
        const cart = await addToCart(cartId, lines);
        return NextResponse.json({ cart });
      } catch (err) {
        if (!(err instanceof ShopifyError) || err.status < 400 || err.status >= 500) throw err;
        // fall through to create
      }
    }
    const cart = await createCart(lines);
    return NextResponse.json({ cart });
  } catch (err) {
    return fail(err);
  }
}

// PATCH { cartId, lineId, quantity } -> update line quantity
export async function PATCH(req: Request) {
  try {
    const { cartId, lineId, quantity } = (await req.json()) as {
      cartId?: string;
      lineId?: string;
      quantity?: number;
    };
    if (!cartId || !lineId || typeof quantity !== "number") {
      return NextResponse.json({ error: "cartId, lineId, quantity required" }, { status: 400 });
    }
    const cart =
      quantity <= 0
        ? await removeCartLine(cartId, lineId)
        : await updateCartLine(cartId, lineId, quantity);
    return NextResponse.json({ cart });
  } catch (err) {
    return fail(err);
  }
}

// DELETE { cartId, lineId } -> remove line
export async function DELETE(req: Request) {
  try {
    const { cartId, lineId } = (await req.json()) as { cartId?: string; lineId?: string };
    if (!cartId || !lineId) {
      return NextResponse.json({ error: "cartId, lineId required" }, { status: 400 });
    }
    const cart = await removeCartLine(cartId, lineId);
    return NextResponse.json({ cart });
  } catch (err) {
    return fail(err);
  }
}
