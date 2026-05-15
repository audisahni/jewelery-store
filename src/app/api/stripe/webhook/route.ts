import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";


export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = await getStripe().webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.stripePaymentIntentId, paymentIntent.id));

      if (orderResult.length > 0) {
        const order = orderResult[0];

        await db
          .update(orders)
          .set({ status: "paid" })
          .where(eq(orders.id, order.id));

        if (order.customerEmail) {
          await sendEmail({
            to: order.customerEmail,
            subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1A1A18; font-size: 24px;">Thank you for your order!</h1>
                <p>Hi ${order.customerName},</p>
                <p>Your order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> has been confirmed and is being prepared.</p>
                <p>We'll notify you when your order ships.</p>
                <p style="color: #C9A84C; font-style: italic;">— The Jewelry Store Team</p>
              </div>
            `,
          });
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.stripePaymentIntentId, paymentIntent.id));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
