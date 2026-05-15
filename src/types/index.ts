import { InferSelectModel } from "drizzle-orm";
import { products, orders, settings } from "@/lib/db/schema";

export type Product = InferSelectModel<typeof products>;
export type Order = InferSelectModel<typeof orders>;
export type Setting = InferSelectModel<typeof settings>;

export interface CartItem {
  product: Product;
  quantity: number;
}