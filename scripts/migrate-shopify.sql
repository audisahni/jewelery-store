-- Clean-slate D1 setup for the headless Shopify storefront.
--
-- Catalog, inventory, and checkout now live in Shopify; D1 only holds the order
-- mirror, the webhook idempotency ledger, and store settings. This script purges
-- the legacy local `products` table and the Stripe-era `orders` table (safe on a
-- brand-new site) and recreates a clean schema.
--
-- Apply (local):  wrangler d1 execute jewelry-store-db --local  --file=./scripts/migrate-shopify.sql
-- Apply (remote): wrangler d1 execute jewelry-store-db --remote --file=./scripts/migrate-shopify.sql

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id                   TEXT PRIMARY KEY,
  shopify_order_id     TEXT UNIQUE,
  shopify_order_number TEXT,
  customer_email       TEXT,
  customer_name        TEXT,
  customer_phone       TEXT,
  items                TEXT,            -- JSON
  subtotal             INTEGER,         -- paise
  shipping             INTEGER,         -- paise
  tax                  INTEGER,         -- GST, paise
  total                INTEGER,         -- paise
  currency             TEXT DEFAULT 'INR',
  status               TEXT,            -- pending|paid|shipped|delivered|cancelled
  financial_status     TEXT,            -- Shopify financial_status
  fulfillment_status   TEXT,            -- Shopify fulfillment_status
  shipping_address     TEXT,            -- JSON
  tracking_number      TEXT,
  created_at           TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Exactly-once inbound webhook processing (Shopify retries/replays deliveries).
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id           TEXT PRIMARY KEY,   -- X-Shopify-Webhook-Id
  topic        TEXT,
  processed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Store settings (name, contact, feature toggles) — retained across the migration.
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
