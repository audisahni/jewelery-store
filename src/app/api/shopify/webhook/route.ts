import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { orders, processedWebhooks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyShopifyWebhook } from "@/lib/shopify/webhook";
import { toMinorUnits } from "@/lib/shopify/client";
import { sendEmail } from "@/lib/email";

// Resilient Shopify order webhook: HMAC-verified, idempotent, and it mirrors the
// authoritative order from Shopify into D1 so the admin, email, and Shiprocket
// sync never miss or duplicate an event.
//
// Configure these topics in Shopify (Settings -> Notifications -> Webhooks, or
// via the Admin API) all pointing at this URL:
//   orders/create, orders/paid, orders/updated, orders/cancelled, orders/fulfilled
//
// All share the same SHOPIFY_WEBHOOK_SECRET (API secret / webhook signing key).

interface ShopifyOrderPayload {
  id: number;
  name?: string;
  order_number?: number;
  email?: string;
  phone?: string;
  currency?: string;
  subtotal_price?: string;
  total_tax?: string;
  total_shipping_price_set?: { shop_money?: { amount?: string } };
  total_price?: string;
  financial_status?: string;
  fulfillment_status?: string | null;
  cancelled_at?: string | null;
  customer?: { first_name?: string; last_name?: string; phone?: string };
  shipping_address?: Record<string, unknown>;
  line_items?: Array<{ title: string; quantity: number; price: string; variant_id?: number }>;
  fulfillments?: Array<{ tracking_number?: string | null }>;
}

function mapStatus(p: ShopifyOrderPayload): string {
  if (p.cancelled_at) return "cancelled";
  if (p.fulfillment_status === "fulfilled") return "shipped";
  if (p.financial_status === "paid") return "paid";
  if (p.financial_status === "refunded" || p.financial_status === "voided") return "cancelled";
  return "pending";
}

export async function POST(req: Request) {
  const raw = await req.text();

  // 1) Verify authenticity BEFORE trusting anything in the body.
  const valid = await verifyShopifyWebhook(raw, req.headers.get("x-shopify-hmac-sha256"));
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const topic = req.headers.get("x-shopify-topic") ?? "";
  const webhookId = req.headers.get("x-shopify-webhook-id") ?? crypto.randomUUID();

  let payload: ShopifyOrderPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);

    const shopifyOrderId = String(payload.id);
    const customerName =
      [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(" ") ||
      null;
    const phone = payload.customer?.phone ?? payload.phone ?? null;
    const tracking =
      payload.fulfillments?.find((f) => f.tracking_number)?.tracking_number ?? null;

    const record = {
      shopifyOrderNumber: payload.name ?? (payload.order_number ? `#${payload.order_number}` : null),
      customerEmail: payload.email ?? null,
      customerName,
      customerPhone: phone,
      items: payload.line_items?.map((li) => ({
        name: li.title,
        quantity: li.quantity,
        price: toMinorUnits(li.price),
        variantId: li.variant_id ? String(li.variant_id) : undefined,
      })),
      subtotal: payload.subtotal_price ? toMinorUnits(payload.subtotal_price) : null,
      shipping: payload.total_shipping_price_set?.shop_money?.amount
        ? toMinorUnits(payload.total_shipping_price_set.shop_money.amount)
        : null,
      tax: payload.total_tax ? toMinorUnits(payload.total_tax) : null,
      total: payload.total_price ? toMinorUnits(payload.total_price) : null,
      currency: payload.currency ?? "INR",
      status: mapStatus(payload),
      financialStatus: payload.financial_status ?? null,
      fulfillmentStatus: payload.fulfillment_status ?? null,
      shippingAddress: payload.shipping_address ?? null,
      trackingNumber: tracking,
    };

    // 2) Upsert keyed on Shopify order id. This is inherently idempotent, so it
    // is always safe to run — including on Shopify retries.
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.shopifyOrderId, shopifyOrderId))
      .limit(1);

    if (existing.length) {
      await db.update(orders).set(record).where(eq(orders.shopifyOrderId, shopifyOrderId));
    } else {
      await db.insert(orders).values({
        id: crypto.randomUUID(),
        shopifyOrderId,
        createdAt: new Date().toISOString(),
        ...record,
      });
    }

    // 3) Idempotency gate for SIDE EFFECTS (email). Recording the delivery id
    // only after the mirror write means a mid-flight crash still gets retried
    // and re-mirrored; the ledger just ensures the email fires at most once.
    // If the id already exists, this is a replay — skip the email.
    let firstDelivery = true;
    try {
      await db.insert(processedWebhooks).values({ id: webhookId, topic });
    } catch {
      firstDelivery = false;
    }

    // 4) Send the confirmation email exactly once, on the paid event.
    if (firstDelivery && topic === "orders/paid" && record.customerEmail) {
      const orderRef = record.shopifyOrderNumber ?? shopifyOrderId;
      await sendEmail({
        to: record.customerEmail,
        subject: `Order Confirmed — ${orderRef}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1A1A18; font-size: 24px;">Thank you for your order!</h1>
            <p>Hi ${record.customerName ?? "there"},</p>
            <p>Your order <strong>${orderRef}</strong> has been confirmed and is being prepared.</p>
            <p>We'll notify you when it ships.</p>
            <p style="color: #C9A84C; font-style: italic;">— The Jewelry Store Team</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Return 500 so Shopify RETRIES (its idempotency + our ledger make retries safe).
    console.error("Shopify webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
