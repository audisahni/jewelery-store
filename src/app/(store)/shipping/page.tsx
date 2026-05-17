import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Information | EZMAY By Gurleen",
  description: "Delivery timelines, packaging, and shipping policy for EZMAY By Gurleen handcrafted Indian jewelry.",
};

export default function ShippingPage() {
  return (
    <div className="pt-32 pb-[120px] px-6">
      <div className="max-w-[760px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-4">Delivery</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">Shipping Information</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="font-body text-base text-muted leading-relaxed max-w-lg mx-auto">
            Every EZMAY piece is carefully packaged in our studio in New Delhi before being dispatched to you.
          </p>
        </div>

        {/* Shipping options */}
        <div className="space-y-8">

          <div className="border-t border-border pt-8">
            <h2 className="font-display text-2xl text-foreground mb-6">Domestic Shipping (India)</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-5">
                  <p className="font-accent text-[10px] tracking-widest uppercase text-muted mb-2">Standard Delivery</p>
                  <p className="font-display text-xl text-foreground mb-1">5–7 Business Days</p>
                  <p className="font-body text-sm text-muted">Free on orders above ₹5,000</p>
                  <p className="font-body text-sm text-primary font-medium mt-1">₹299 below threshold</p>
                </div>
                <div className="bg-secondary/50 p-5">
                  <p className="font-accent text-[10px] tracking-widest uppercase text-muted mb-2">Express Delivery</p>
                  <p className="font-display text-xl text-foreground mb-1">2–3 Business Days</p>
                  <p className="font-body text-sm text-muted">Available at checkout</p>
                  <p className="font-body text-sm text-primary font-medium mt-1">₹599</p>
                </div>
                <div className="bg-secondary/50 p-5">
                  <p className="font-accent text-[10px] tracking-widest uppercase text-muted mb-2">Same-Day Delivery</p>
                  <p className="font-display text-xl text-foreground mb-1">Delhi NCR Only</p>
                  <p className="font-body text-sm text-muted">Order by 11 AM</p>
                  <p className="font-body text-sm text-primary font-medium mt-1">Contact us</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="font-display text-2xl text-foreground mb-6">International Shipping</h2>
            <p className="font-body text-sm text-muted leading-relaxed mb-4">
              We ship internationally to most countries. International orders are shipped via tracked courier
              services and typically arrive within 10–15 business days, depending on the destination country
              and customs processing times.
            </p>
            <p className="font-body text-sm text-muted leading-relaxed mb-4">
              International shipping rates are calculated at checkout based on the destination and package weight.
              Please note that customs duties, import taxes, and any other applicable fees are the responsibility
              of the recipient and are not included in our shipping charges.
            </p>
            <p className="font-body text-sm text-muted leading-relaxed">
              For international enquiries or specific country rates, please contact us before placing your order.
            </p>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="font-display text-2xl text-foreground mb-6">Our Packaging</h2>
            <p className="font-body text-sm text-muted leading-relaxed mb-4">
              Every EZMAY piece is packaged in our signature cloth pouch and placed inside a rigid gift box,
              making it ready for gifting without any additional preparation. Larger or more delicate pieces
              receive additional protective wrapping.
            </p>
            <p className="font-body text-sm text-muted leading-relaxed">
              We use minimal, environmentally considered packaging materials — beautiful enough to keep,
              responsible enough to feel good about.
            </p>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="font-display text-2xl text-foreground mb-6">Order Processing</h2>
            <p className="font-body text-sm text-muted leading-relaxed mb-4">
              Orders are processed and dispatched from our New Delhi studio within 1–2 business days of
              payment confirmation. Custom and made-to-order pieces require additional crafting time, which
              will be communicated at the time of order.
            </p>
            <p className="font-body text-sm text-muted leading-relaxed">
              You will receive a dispatch confirmation with tracking details as soon as your order ships.
            </p>
          </div>

        </div>

        {/* Contact */}
        <div className="mt-16 pt-12 border-t border-border text-center">
          <p className="font-body text-sm text-muted mb-4">
            Questions about your shipment? We are happy to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 font-accent text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
          >
            Contact Us
          </Link>
        </div>

      </div>
    </div>
  );
}
