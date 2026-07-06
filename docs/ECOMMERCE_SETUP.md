# Headless Shopify Storefront — Setup Runbook (India)

This store is a **Next.js (App Router) storefront on Cloudflare** backed by
**Shopify (Storefront API)** for catalog, inventory, and cart, using **Shopify's
hosted checkout** for payments (Razorpay/UPI/EMI), GST, and shipping selection.

> **Handing account setup to a non-technical person?** Give them
> [SHOPIFY_ACCOUNT_SETUP.md](./SHOPIFY_ACCOUNT_SETUP.md) — a plain-language,
> click-by-click guide. The six values they send back map to the secrets/vars
> below: (1) store address → `SHOPIFY_STORE_DOMAIN`, (2) Storefront token →
> `SHOPIFY_STOREFRONT_API_TOKEN`, (3) webhook signing secret →
> `SHOPIFY_WEBHOOK_SECRET`, (4) Shiprocket email → `SHIPROCKET_EMAIL`,
> (5) Shiprocket password → `SHIPROCKET_PASSWORD`, (6) pickup PIN →
> `SHIPROCKET_PICKUP_PINCODE`. You supply them one thing: the deployed webhook
> URL `https://<your-domain>/api/shopify/webhook` for their Webhooks step.

> **Architecture decision.** You chose Shopify-hosted checkout. That means
> payments, tax (GST), and shipping-rate selection happen **inside Shopify's
> checkout** — there is intentionally **no custom Razorpay/GST/checkout code**
> in this repo (building one would double-charge and break Shopify order
> creation). Razorpay/UPI/EMI and the 3% GST rule are **Shopify configuration**,
> described below. What the app owns: catalog/cart via the Storefront API, INR +
> GST display, a Shiprocket pincode/ETA widget, the checkout hand-off, and a
> resilient order webhook that mirrors Shopify orders into D1.

## What is CODE vs CONFIG

| Requirement | Where it lives |
|---|---|
| Product catalog & inventory | **Code** — Storefront API (`src/lib/shopify/*`) |
| Cart | **Code** — Shopify Cart API via `/api/cart` + `useCart` |
| Checkout, payments (Razorpay/UPI/EMI) | **Config** — Shopify Admin → Payments |
| 3% GST on jewelry | **Config** — Shopify tax rule; **Code** only for display label |
| Shipping rates & fulfillment | **Config** — Shopify Shipping / Shiprocket Shopify app |
| Pincode serviceability + ETA (pre-checkout) | **Code** — `src/lib/shiprocket.ts` + `/api/shiprocket/serviceability` |
| Order mirror / no missed events | **Code** — `/api/shopify/webhook` (HMAC + idempotent) |

---

## 1. Shopify store

1. Create a Shopify store (Basic plan is enough for a custom storefront).
2. Set **store currency = INR** (Settings → Store details).
3. Add products. Set **Product type** (maps to our category), tag pieces
   `featured` to surface them on the home page, and put material text in a
   metafield `custom.material` (Settings → Custom data → Products) — the
   storefront reads it, falling back to vendor.

### Storefront API token (custom app)

Settings → Apps and sales channels → **Develop apps** → create an app →
**Storefront API** → enable scopes: `unauthenticated_read_product_listings`,
`unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`,
`unauthenticated_read_checkouts`. Install → copy the **Storefront API access
token**.

Set:
- `SHOPIFY_STORE_DOMAIN` = `your-store.myshopify.com` (wrangler.toml [vars])
- `SHOPIFY_STOREFRONT_API_TOKEN` = the token (secret — see §5)

## 2. Payments — Razorpay (UPI + EMI), configured IN Shopify

Settings → **Payments** → add **Razorpay** (Shopify has a native India
integration). In your Razorpay dashboard enable **UPI** and **EMI / No-cost EMI**
for high-ticket jewelry. Because checkout is Shopify-hosted, no keys go in this
repo — UPI intent on mobile web and EMI options are rendered by Razorpay on
Shopify's checkout automatically.

## 3. GST (3% on jewelry)

Settings → **Taxes and duties** → India. Configure a **3% GST** rate for your
jewelry products (or a 1.5% CGST + 1.5% SGST split). Recommended:
Settings → Taxes → **"All prices include tax"** so displayed prices are
GST-inclusive (standard for Indian B2C jewelry). The storefront then shows an
"Inclusive of 3% GST" line (`src/lib/india.ts`), while Shopify remains the
authoritative tax calculator at checkout. To change the displayed rate only, set
`NEXT_PUBLIC_GST_RATE` (build-time).

## 4. Order webhooks (resilience: no missed/duplicated orders)

Settings → **Notifications → Webhooks** (or the Admin API). Create webhooks for
these topics, all pointing to `https://<your-domain>/api/shopify/webhook`,
format **JSON**:

- `orders/create`
- `orders/paid`
- `orders/updated`
- `orders/cancelled`
- `orders/fulfilled`

Copy the webhook **signing secret** → `SHOPIFY_WEBHOOK_SECRET`.

The handler (`src/app/api/shopify/webhook/route.ts`):
- verifies the HMAC signature (Web Crypto) before trusting the body,
- **upserts** the order into D1 keyed on Shopify order id (idempotent),
- gates the confirmation email on a `processed_webhooks` ledger (exactly-once),
- returns **500 on failure so Shopify retries** — safe because the upsert is
  idempotent.

## 5. Shiprocket (pincode serviceability + ETA)

Create a Shiprocket API user (Settings → API → Configure). Set:
- `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD` (secrets)
- `SHIPROCKET_PICKUP_PINCODE` (your origin PIN, wrangler.toml [vars])

The product page calls `/api/shiprocket/serviceability`, which logs in (token
cached in isolate memory, auto-refreshed on 401) and returns the fastest
courier's ETA + cheapest rate. For **post-order fulfillment** (labels, tracking,
pickup), install the **Shiprocket app inside Shopify** — that side is Shopify's.

## 6. Secrets & environment

Non-sensitive config is in `wrangler.toml [vars]`. Secrets must be set with
wrangler (never committed):

```bash
wrangler secret put SHOPIFY_STOREFRONT_API_TOKEN
wrangler secret put SHOPIFY_WEBHOOK_SECRET
wrangler secret put SHIPROCKET_EMAIL
wrangler secret put SHIPROCKET_PASSWORD
# (existing) wrangler secret put RESEND_API_KEY
```

Local dev: copy `.dev.vars.example` → `.dev.vars` (gitignored) and fill in.

## 7. Database migration (order mirror + webhook idempotency)

```bash
# local
wrangler d1 execute jewelry-store-db --local --file=./scripts/migrate-shopify.sql
# remote
wrangler d1 execute jewelry-store-db --remote --file=./scripts/migrate-shopify.sql
```

## 8. Deploy

```bash
npm run deploy   # opennextjs-cloudflare build && deploy
```

---

## Notes / what was removed (clean slate)

- **Stripe fully removed** — lib, checkout route, webhook, custom checkout UI,
  and the `stripe` / `@stripe/*` deps.
- **Local product management fully removed** — `/admin/products*`, `/api/products`,
  the product form/table, and the legacy D1 `products` table. Products, inventory,
  and pricing are managed in **Shopify Admin**; the admin dashboard links out to it.
- **R2 image upload removed** — product images are hosted by Shopify, so the R2
  bucket binding, `/api/upload`, the image uploader, and the `@aws-sdk/*` deps are
  gone. (`R2_PUBLIC_URL` / R2 keys are no longer needed.)
- **Unused deps pruned** — `react-hook-form`, `@hookform/resolvers`, `zod`,
  `@paralleldrive/cuid2`, and the `tsx` seed tooling (the seed script was removed).
- The `orders` D1 table is the **order mirror**, populated by the Shopify webhook —
  it powers the admin order view, confirmation emails, and Shiprocket sync.
- Run `scripts/migrate-shopify.sql` to purge the legacy tables and create the clean
  schema (see §7).
- The free-shipping progress bar in the cart is a **marketing nudge only**; actual
  shipping is decided by Shopify at checkout.
