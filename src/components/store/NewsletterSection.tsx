"use client";

import { useEcommerce } from "@/contexts/EcommerceContext";

export default function NewsletterSection() {
  const { newsletterEnabled } = useEcommerce();

  if (!newsletterEnabled) return null;

  return (
    <section className="py-[120px] px-6 bg-foreground text-background">
      <div className="max-w-[560px] mx-auto text-center">
        <p className="font-accent text-xs tracking-[0.3em] uppercase text-background/60 mb-4">Stay Connected</p>
        <h2 className="font-display text-4xl md:text-5xl text-background mb-4">
          First to Know
        </h2>
        <p className="font-body text-sm text-background/70 mb-10">
          Be the first to see new designs from Gurleen&apos;s studio — new arrivals, behind-the-scenes, and exclusive pieces.
        </p>
        <form action="#" method="POST" className="flex gap-0">
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            required
            className="flex-1 bg-background/10 border border-background/20 text-background placeholder:text-background/40 px-5 py-3 text-sm font-body outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="bg-primary text-white font-accent text-xs tracking-widest uppercase px-8 py-3 hover:bg-primary/80 transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
