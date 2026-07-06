// High-level Shopify Storefront helpers used by server components and API routes.
// Normalizes raw Shopify shapes → our StoreProduct / StoreCart types.

import "server-only";
import { shopifyFetch, toMinorUnits, ShopifyError } from "./client";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from "./queries";
import type {
  ShopifyProduct,
  ShopifyCart,
  StoreProduct,
  StoreCart,
  StoreVariant,
} from "./types";

const CATALOG_REVALIDATE = 60; // seconds — ISR for catalog reads
export const PRODUCTS_TAG = "shopify-products";

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

function normalizeVariant(v: ShopifyProduct["variants"]["nodes"][number]): StoreVariant {
  return {
    id: v.id,
    title: v.title,
    available: v.availableForSale,
    quantityAvailable: v.quantityAvailable,
    price: toMinorUnits(v.price.amount),
    compareAtPrice: v.compareAtPrice ? toMinorUnits(v.compareAtPrice.amount) : null,
    options: v.selectedOptions,
  };
}

export function normalizeProduct(p: ShopifyProduct): StoreProduct {
  const variants = p.variants.nodes.map(normalizeVariant);
  const firstAvailable = variants.find((v) => v.available) ?? variants[0] ?? null;
  const images = p.images.nodes.map((i) => i.url);
  const compareAt = p.compareAtPriceRange?.minVariantPrice?.amount
    ? toMinorUnits(p.compareAtPriceRange.minVariantPrice.amount)
    : null;
  const price = toMinorUnits(p.priceRange.minVariantPrice.amount);

  return {
    id: p.id,
    slug: p.handle,
    name: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    category: p.productType || "",
    material: p.metafield?.value || p.vendor || "",
    price,
    compareAtPrice: compareAt && compareAt > price ? compareAt : null,
    currencyCode: p.priceRange.minVariantPrice.currencyCode,
    images,
    primaryImage: p.featuredImage?.url ?? images[0] ?? null,
    available: p.availableForSale,
    featured: p.tags.map((t) => t.toLowerCase()).includes("featured"),
    variants,
    defaultVariantId: firstAvailable?.id ?? null,
    metaTitle: p.seo.title,
    metaDescription: p.seo.description,
  };
}

function normalizeCart(c: ShopifyCart): StoreCart {
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    subtotal: toMinorUnits(c.cost.subtotalAmount.amount),
    total: toMinorUnits(c.cost.totalAmount.amount),
    totalTax: c.cost.totalTaxAmount ? toMinorUnits(c.cost.totalTaxAmount.amount) : null,
    currencyCode: c.cost.totalAmount.currencyCode,
    lines: c.lines.nodes.map((l) => ({
      id: l.id,
      variantId: l.merchandise.id,
      quantity: l.quantity,
      name: l.merchandise.product.title,
      slug: l.merchandise.product.handle,
      variantTitle: l.merchandise.title,
      image: l.merchandise.product.featuredImage?.url ?? null,
      price: toMinorUnits(l.merchandise.price.amount),
      lineTotal: toMinorUnits(l.cost.totalAmount.amount),
    })),
  };
}

// ---------------------------------------------------------------------------
// Catalog reads (cached, tagged for revalidation)
// ---------------------------------------------------------------------------

export async function getProducts(opts?: {
  featured?: boolean;
  category?: string;
  first?: number;
}): Promise<StoreProduct[]> {
  const queryParts: string[] = ["available_for_sale:true"];
  if (opts?.category) queryParts.push(`product_type:'${opts.category}'`);
  if (opts?.featured) queryParts.push("tag:featured");

  try {
    const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
      query: PRODUCTS_QUERY,
      variables: {
        first: opts?.first ?? 50,
        query: queryParts.join(" AND "),
        sortKey: "CREATED_AT",
        reverse: true,
      },
      revalidate: CATALOG_REVALIDATE,
      tags: [PRODUCTS_TAG],
    });
    return data.products.nodes.map(normalizeProduct);
  } catch (err) {
    // Degrade gracefully so a Shopify outage renders an empty grid, not a 500.
    console.error("getProducts failed:", err instanceof ShopifyError ? err.details : err);
    return [];
  }
}

export async function getProduct(handle: string): Promise<StoreProduct | null> {
  try {
    const data = await shopifyFetch<{ product: ShopifyProduct | null }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
      revalidate: CATALOG_REVALIDATE,
      tags: [PRODUCTS_TAG, `product:${handle}`],
    });
    return data.product ? normalizeProduct(data.product) : null;
  } catch (err) {
    console.error("getProduct failed:", err instanceof ShopifyError ? err.details : err);
    return null;
  }
}

export async function getCollectionProducts(
  handle: string,
  first = 50,
): Promise<StoreProduct[]> {
  try {
    const data = await shopifyFetch<{
      collection: { products: { nodes: ShopifyProduct[] } } | null;
    }>({
      query: COLLECTION_PRODUCTS_QUERY,
      variables: { handle, first },
      revalidate: CATALOG_REVALIDATE,
      tags: [PRODUCTS_TAG, `collection:${handle}`],
    });
    return data.collection?.products.nodes.map(normalizeProduct) ?? [];
  } catch (err) {
    console.error("getCollectionProducts failed:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Cart operations (never cached — always no-store)
// ---------------------------------------------------------------------------

interface LineInput {
  merchandiseId: string;
  quantity: number;
}

export async function getCart(cartId: string): Promise<StoreCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: CART_QUERY,
    variables: { id: cartId },
    cache: "no-store",
  });
  return data.cart ? normalizeCart(data.cart) : null;
}

export async function createCart(lines: LineInput[]): Promise<StoreCart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: ShopifyCart | null; userErrors: { message: string }[] };
  }>({
    query: CART_CREATE_MUTATION,
    variables: { lines },
    cache: "no-store",
  });
  assertNoUserErrors(data.cartCreate.userErrors);
  if (!data.cartCreate.cart) throw new ShopifyError("cartCreate returned no cart", 502);
  return normalizeCart(data.cartCreate.cart);
}

export async function addToCart(cartId: string, lines: LineInput[]): Promise<StoreCart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart | null; userErrors: { message: string }[] };
  }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
  });
  assertNoUserErrors(data.cartLinesAdd.userErrors);
  if (!data.cartLinesAdd.cart) throw new ShopifyError("cartLinesAdd returned no cart", 502);
  return normalizeCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<StoreCart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: ShopifyCart | null; userErrors: { message: string }[] };
  }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    cache: "no-store",
  });
  assertNoUserErrors(data.cartLinesUpdate.userErrors);
  if (!data.cartLinesUpdate.cart) throw new ShopifyError("cartLinesUpdate returned no cart", 502);
  return normalizeCart(data.cartLinesUpdate.cart);
}

export async function removeCartLine(cartId: string, lineId: string): Promise<StoreCart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart | null; userErrors: { message: string }[] };
  }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
    cache: "no-store",
  });
  assertNoUserErrors(data.cartLinesRemove.userErrors);
  if (!data.cartLinesRemove.cart) throw new ShopifyError("cartLinesRemove returned no cart", 502);
  return normalizeCart(data.cartLinesRemove.cart);
}

function assertNoUserErrors(errors: { message: string }[]): void {
  if (errors && errors.length) {
    throw new ShopifyError(errors.map((e) => e.message).join("; "), 400, errors);
  }
}
