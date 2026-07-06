import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Catalog & inventory live in Shopify (Storefront API). D1 holds only the order
// mirror, webhook idempotency ledger, and store settings.

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  // Shopify is the source of truth for orders; the webhook mirrors them here for
  // the admin view, confirmation email, and Shiprocket sync.
  shopifyOrderId: text("shopify_order_id").unique(),
  shopifyOrderNumber: text("shopify_order_number"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  items: text("items", { mode: "json" }), // JSON
  subtotal: integer("subtotal"),
  shipping: integer("shipping"),
  tax: integer("tax"), // GST, paise
  total: integer("total"),
  currency: text("currency").default("INR"),
  status: text("status"), // pending|paid|shipped|delivered|cancelled
  financialStatus: text("financial_status"), // Shopify financial_status
  fulfillmentStatus: text("fulfillment_status"), // Shopify fulfillment_status
  shippingAddress: text("shipping_address", { mode: "json" }), // JSON
  trackingNumber: text("tracking_number"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Idempotency ledger for inbound webhooks (Shopify sends X-Shopify-Webhook-Id
// and may retry/replay). We record processed IDs to make handling exactly-once.
export const processedWebhooks = sqliteTable("processed_webhooks", {
  id: text("id").primaryKey(), // X-Shopify-Webhook-Id
  topic: text("topic"),
  processedAt: text("processed_at").default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});
