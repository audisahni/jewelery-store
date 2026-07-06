import { InferSelectModel } from "drizzle-orm";
import { orders, settings } from "@/lib/db/schema";

// Storefront product/cart types come from the Shopify normalization layer.
// `Product` is aliased to StoreProduct so storefront imports read naturally.
export type { StoreProduct as Product, StoreCart, StoreCartLine, StoreVariant } from "@/lib/shopify/types";

// Orders are mirrored locally in D1 (populated by the Shopify webhook).
export type Order = InferSelectModel<typeof orders>;
export type Setting = InferSelectModel<typeof settings>;
