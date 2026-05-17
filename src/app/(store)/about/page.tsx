import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Gurleen | EZMAY By Gurleen",
  description: "The story of Gurleen — professional jewelry designer, professor, and founder of EZMAY, handcrafted artisan Indian jewelry from New Delhi.",
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-[120px] px-6">
      <div className="max-w-[760px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-4">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">About Gurleen</h1>
          <div className="w-12 h-px bg-primary mx-auto" />
        </div>

        {/* Story */}
        <div className="space-y-8 font-body text-base text-muted leading-relaxed">
          <p>
            EZMAY By Gurleen is the culmination of a life devoted to the art of Indian jewelry. Founded and led by
            Gurleen, a professionally trained jewelry designer based in New Delhi, EZMAY is where craft, culture,
            and creativity converge.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-12">A Designer&apos;s Journey</h2>
          <p>
            With over 15 years of professional experience, Gurleen has dedicated her career to the study and practice
            of India&apos;s rich jewelry-making traditions. Her journey began with a deep curiosity about the techniques
            that have defined Indian adornment for centuries — from the intricate stone-setting of Kundan to the
            vibrant enamel work of Meenakari, and the raw, uncut brilliance of Polki and Jadau.
          </p>
          <p>
            Over the years, she has worked across styles and scales — from delicate everyday pieces to elaborate
            bridal sets — always with the same commitment: that every piece leaving her studio should be worthy of
            being passed down through generations.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-12">A Professor&apos;s Calling</h2>
          <p>
            Alongside her design practice, Gurleen has served as a professor, teaching jewelry design and traditional
            Indian craft techniques to the next generation of artisans and designers. She has guided hundreds of
            students, instilling in them not only technical skill but also a deep reverence for the heritage they are
            inheriting.
          </p>
          <p>
            This dual life — as both practitioner and educator — has given Gurleen a rare perspective. She understands
            the craft from the inside out: the patience it demands, the precision it requires, and the joy it delivers
            when a piece is finally complete and beautiful.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-12">The EZMAY Philosophy</h2>
          <p>
            EZMAY — the brand Gurleen built — is a reflection of everything she believes in. Each piece is designed
            by her hand, crafted using traditional Indian techniques, and finished with the care of an artisan who
            has spent a lifetime perfecting her craft.
          </p>
          <p>
            The name EZMAY is a promise: that what you hold is not mass-produced, not replicated, not rushed.
            It is handmade in New Delhi, rooted in India&apos;s cultural heritage, and intended to be worn with pride —
            today, and by the generations that follow.
          </p>
        </div>

        {/* Signature block */}
        <div className="mt-16 pt-12 border-t border-border text-center">
          <p className="font-display text-2xl text-foreground mb-2">Gurleen</p>
          <p className="font-accent text-xs tracking-widest uppercase text-primary mb-8">
            Founder · Jewelry Designer · Professor · New Delhi, India
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 font-accent text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
          >
            Explore the Collection
          </Link>
        </div>

      </div>
    </div>
  );
}
