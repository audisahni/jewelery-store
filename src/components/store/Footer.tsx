import Link from "next/link";
import NewsletterForm from "@/components/store/NewsletterForm";

const shopLinks = [
  { href: "/shop", label: "All Jewelry" },
  { href: "/shop?category=rings", label: "Rings" },
  { href: "/shop?category=necklaces", label: "Necklaces" },
  { href: "/shop?category=earrings", label: "Earrings" },
  { href: "/shop?category=bracelets", label: "Bracelets" },
];

const infoLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/care", label: "Jewelry Care" },
  { href: "/returns", label: "Returns & Exchanges" },
  { href: "/shipping", label: "Shipping Info" },
  { href: "/contact", label: "Contact Us" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      {/* Main footer grid */}
      <div className="max-w-[1320px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Link
            href="/"
            className="font-display text-xl tracking-[0.25em] uppercase text-foreground w-fit"
          >
            Lumière
          </Link>
          <p className="font-body text-sm text-muted leading-relaxed max-w-[220px]">
            Handcrafted fine jewelry for moments that last forever.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4 mt-auto">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="font-accent text-[10px] tracking-widest uppercase text-muted hover:text-primary transition-colors"
            >
              Instagram
            </a>
            <span className="w-px h-3 bg-border" aria-hidden />
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="font-accent text-[10px] tracking-widest uppercase text-muted hover:text-primary transition-colors"
            >
              Pinterest
            </a>
          </div>
        </div>

        {/* Shop links */}
        <div className="flex flex-col gap-5">
          <p className="font-accent text-xs tracking-widest uppercase text-foreground">
            Shop
          </p>
          <ul className="flex flex-col gap-3">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info links */}
        <div className="flex flex-col gap-5">
          <p className="font-accent text-xs tracking-widest uppercase text-foreground">
            Information
          </p>
          <ul className="flex flex-col gap-3">
            {infoLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-5">
          <p className="font-accent text-xs tracking-widest uppercase text-foreground">
            Stay in Touch
          </p>
          <p className="font-body text-sm text-muted leading-relaxed">
            New arrivals, exclusive offers, and jewelry care tips — delivered
            with intention.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-[1320px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-muted">
            © {year} Lumière. All rights reserved.
          </p>

          {/* Payment method representations */}
          <div className="flex items-center gap-3">
            {["Visa", "Mastercard", "Amex", "PayPal"].map((method) => (
              <span
                key={method}
                className="font-accent text-[9px] tracking-wider uppercase border border-border px-2 py-1 text-muted"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
