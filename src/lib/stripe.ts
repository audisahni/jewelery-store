import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia" as any, // fallback type casting to prevent ts errors
  appInfo: {
    name: "Jewelry Store",
    version: "0.1.0",
  },
});