import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { total, customerEmail, customerName, items, subtotal, shipping, shippingAddress } = body;

    if (!total || total < 50) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        customerEmail,
        customerName,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
