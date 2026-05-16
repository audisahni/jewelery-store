import Link from "next/link";

interface HeroProps {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function Hero({
  heading = "Born of\nTradition",
  subheading = "Handcrafted artisan jewelry rooted in India's rich cultural heritage — each piece designed and made by Gurleen in New Delhi.",
  ctaText = "View Collection",
  ctaHref = "/shop",
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Hero content */}
      <div className="flex-1 flex items-center justify-center bg-secondary relative overflow-hidden px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, var(--color-background) 0%, transparent 70%)",
            opacity: 0.35,
          }}
        />

        <div className="relative text-center max-w-4xl mx-auto">
          {/* Eyebrow */}
          <p
            className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-8"
            style={{
              animation: "fadeUp 0.8s ease forwards",
              animationDelay: "0.1s",
              opacity: 0,
            }}
          >
            EZMAY By Gurleen
          </p>

          {/* Main heading */}
          <h1
            className="font-display text-6xl md:text-8xl lg:text-[110px] leading-[0.9] tracking-tight text-foreground mb-8 whitespace-pre-line"
            style={{
              animation: "fadeUp 0.8s ease forwards",
              animationDelay: "0.25s",
              opacity: 0,
            }}
          >
            {heading}
          </h1>

          {/* Gold divider */}
          <div
            className="w-16 h-px bg-primary mx-auto mb-8"
            style={{
              animation: "fadeUp 0.8s ease forwards",
              animationDelay: "0.4s",
              opacity: 0,
            }}
          />

          {/* Subheading */}
          <p
            className="font-body text-base md:text-lg text-muted max-w-md mx-auto mb-12 leading-relaxed"
            style={{
              animation: "fadeUp 0.8s ease forwards",
              animationDelay: "0.55s",
              opacity: 0,
            }}
          >
            {subheading}
          </p>

          {/* CTA */}
          <div
            style={{
              animation: "fadeUp 0.8s ease forwards",
              animationDelay: "0.7s",
              opacity: 0,
            }}
          >
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-3 bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-primary transition-colors duration-300"
            >
              {ctaText}
              <span className="w-6 h-px bg-current" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none pointer-events-none">
          <span className="font-accent text-[9px] tracking-[0.3em] uppercase text-foreground opacity-40">
            Scroll
          </span>
          <div
            className="w-px h-12 bg-foreground origin-top"
            style={{ animation: "scrollIndicator 2s ease-in-out infinite" }}
          />
        </div>
      </div>
    </section>
  );
}
