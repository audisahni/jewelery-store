# Jewelry Store

A luxury jewelry e-commerce platform built with Next.js 15 App Router, deployed to Cloudflare Pages with D1 (SQLite) and R2 (object storage).

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Runtime**: Cloudflare Pages (Edge Runtime via `@cloudflare/next-on-pages`)
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare R2 (product images)
- **Auth**: NextAuth v5 (credentials provider, edge-compatible)
- **Payments**: Stripe (Payment Intents + webhooks)
- **Email**: Resend
- **UI**: Tailwind CSS v4, Base UI, Lucide icons
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## Prerequisites

- Node.js 20+
- A Cloudflare account with Pages, D1, and R2 enabled
- A Stripe account (live or test mode)
- A Resend account for transactional email

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd jewelry-store
npm install
```

### 2. Create a Cloudflare D1 database

```bash
npx wrangler d1 create jewelry-store-db
```

Copy the `database_id` from the output and add it to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "jewelry-store-db"
database_id = "<your-database-id>"
```

### 3. Run database migrations

```bash
npx wrangler d1 execute jewelry-store-db --local --file=./drizzle/<migration>.sql
```

Or use Drizzle Kit:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Seed sample data

```bash
npm run seed
# This writes scripts/seed.sql, then apply it:
npx wrangler d1 execute jewelry-store-db --local --file=./scripts/seed.sql
```

### 5. Create a Cloudflare R2 bucket

```bash
npx wrangler r2 bucket create jewelry-store-images
```

### 6. Configure environment variables

Create a `.env.local` file:

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Admin credentials (hash generated below)
ADMIN_EMAIL=admin@yourstore.com
ADMIN_PASSWORD_HASH=<bcrypt hash>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM=orders@yourstore.com

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=jewelry-store-images
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

### 7. Generate an admin password hash

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 12).then(h => console.log(h))"
```

Paste the output as `ADMIN_PASSWORD_HASH` in `.env.local`.

### 8. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a Cloudflare-accurate local preview (with D1 and R2 bindings):

```bash
npm run build
npx wrangler pages dev .vercel/output/static --d1=DB
```

## Deploy to Cloudflare Pages

### 1. Connect your repository

In the Cloudflare dashboard, go to Pages > Create a project > Connect to Git and select your repository.

### 2. Build settings

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Build command | `npm run build` |
| Build output directory | `.vercel/output/static` |

### 3. Add environment variables

Add all variables from `.env.local` in the Pages project settings under Settings > Environment variables.

### 4. Add D1 and R2 bindings

In Pages project settings > Functions > D1 database bindings:
- Variable name: `DB`
- D1 database: `jewelry-store-db`

For R2, add an R2 bucket binding if using Workers R2 SDK, or use the S3-compatible API with the environment variables above.

### 5. Run migrations on production D1

```bash
npx wrangler d1 execute jewelry-store-db --file=./scripts/seed.sql
```

### 6. Configure Stripe webhook

In the Stripe dashboard, add a webhook endpoint pointing to:

```
https://your-domain.pages.dev/api/stripe/webhook
```

Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## First-Time Admin Setup

1. Navigate to `https://your-domain/admin`
2. Sign in with the email and password you set in `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`
3. From the admin dashboard you can:
   - Add, edit, and archive products
   - Upload product images to R2
   - View and manage orders
   - Update order status and tracking numbers
4. To change your admin password, generate a new hash and update `ADMIN_PASSWORD_HASH` in your environment variables, then redeploy.

## Project Structure

```
src/
  app/
    (store)/          # Public storefront pages
    (admin)/          # Admin dashboard (auth-gated)
    api/
      auth/           # NextAuth handlers
      orders/         # Order CRUD
      products/       # Product CRUD
      stripe/webhook/ # Stripe webhook handler
      upload/         # R2 image upload
    sitemap.ts
    robots.ts
  lib/
    auth.ts           # NextAuth config
    db/               # Drizzle schema and client
    email.ts          # Resend helpers
    stripe.ts         # Stripe client
    utils.ts          # cn(), formatPrice(), etc.
scripts/
  seed.ts             # Generates seed.sql for D1
```
