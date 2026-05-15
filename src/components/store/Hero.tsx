import Link from "next/link";

interface HeroProps {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?: string;
  announcementText?: string;
}

export default function Hero({
  heading = "Crafted for\nEternity",
  subheading = "Discover our collection of handcrafted fine jewelry, where each piece tells a story of timeless elegance.",
  ctaText = "Explore Collection",
  ctaHref = "/shop",
  announcementText = "Complimentary shipping on orders over $500  ·  Certified fine jewelry  ·  30-day returns",
}: HeroProps) {
  // Repeat announcement text enough times that it fills the marquee track (we duplicate for seamless loop)
  const repeatedText = Array(6).fill(announcementText).join("    ·    ");

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Announcement bar */}
      <div className="bg-foreground text-background overflow-hidden shrink-0">
        <div className="flex py-2.5">
          {/* Two identical spans side-by-side; the animation moves left by 50% for a seamless loop */}
          <div
            className="flex shrink-0 whitespace-nowrap"
            style={{ animation: "marquee 30s linear infinite" }}
          >
            <span className="font-accent text-[10px] tracking-[0.2em] uppercase px-8">
              {repeatedText}
            </span>
            {/* Duplicate to fill the second half so the loop is invisible */}
            <span className="font-accent text-[10px] tracking-[0.2em] uppercase px-8" aria-hidden>
              {repeatedText}
            </span>
          </div>
        </div>
      </div>

      {/* Hero content */}
      <div className="flex-1 flex items-center justify-center bg-secondary relative overflow-hidden px-6">
        {/* Subtle vignette gradient */}
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
            Fine Jewelry Collection
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
