import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(), // cuid
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(), // cents
  compareAtPrice: integer("compare_at_price"), // cents
  category: text("category"),
  material: text("material"),
  images: text("images", { mode: "json" }), // JSON array of R2 URLs
  primaryImage: text("primary_image"),
  stock: integer("stock").default(0),
  featured: integer("featured", { mode: "boolean" }).default(false),
  active: integer("active", { mode: "boolean" }).default(true),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  weight: real("weight"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  items: text("items", { mode: "json" }), // JSON
  subtotal: integer("subtotal"),
  shipping: integer("shipping"),
  total: integer("total"),
  status: text("status"), // pending|paid|shipped|delivered|cancelled
  shippingAddress: text("shipping_address", { mode: "json" }), // JSON
  trackingNumber: text("tracking_number"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});