import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-10-28.acacia" as any,
      appInfo: { name: "Jewelry Store", version: "0.1.0" },
    });
  }
  return _stripe;
}
