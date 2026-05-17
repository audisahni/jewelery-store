import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jewelry Care | EZMAY By Gurleen",
  description: "How to care for your EZMAY handcrafted Indian jewelry — cleaning, storage, and preservation tips from our artisans.",
};

const careGuide = [
  {
    title: "Storage",
    content: [
      "Store each piece separately in the soft cloth pouch provided, or wrap in acid-free tissue paper. This prevents scratching between pieces.",
      "Keep jewelry away from direct sunlight, humidity, and extreme temperatures. A cool, dry drawer or a dedicated jewelry box is ideal.",
      "Store silver pieces in an airtight container or zip-lock pouch to slow tarnishing.",
    ],
  },
  {
    title: "Cleaning",
    content: [
      "Gently wipe your jewelry with a soft, dry, lint-free cloth after each wear to remove skin oils and dust.",
      "For silver pieces, use a specialist silver polishing cloth. Avoid abrasive materials that can scratch the surface.",
      "Kundan and Meenakari pieces should never be immersed in water or cleaned with liquid solutions, as moisture can loosen the lac base and damage the enamel.",
      "For gold-plated pieces, use a very soft, damp cloth with mild soap. Dry immediately and thoroughly.",
    ],
  },
  {
    title: "Daily Wear",
    content: [
      "Put jewelry on after applying perfume, hairspray, and makeup — chemicals in cosmetics can accelerate tarnishing and dull gemstones.",
      "Remove jewelry before bathing, swimming, or any water-related activities. Chlorine and saltwater are particularly damaging.",
      "Remove pieces before physical exercise. Sweat accelerates tarnishing, and impact can bend delicate settings.",
      "Take off rings and bracelets when washing hands or doing household chores.",
    ],
  },
  {
    title: "Gemstones",
    content: [
      "Avoid ultrasonic cleaners for pieces with Polki, Kundan, or lac-set stones — vibration can loosen settings.",
      "Most gemstones can be gently cleaned with a soft brush and mild soapy water, but always check with us first if you are unsure.",
      "Inspect settings periodically. If a stone feels loose, bring the piece in for professional re-setting before wearing it again.",
    ],
  },
  {
    title: "Professional Care",
    content: [
      "We recommend having your most-worn pieces professionally cleaned and inspected once a year.",
      "If a piece requires repair, please contact us directly. Attempting home repairs can cause irreversible damage to handcrafted jewelry.",
    ],
  },
];

export default function CarePage() {
  return (
    <div className="pt-32 pb-[120px] px-6">
      <div className="max-w-[760px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-4">Preservation Guide</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">Jewelry Care</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="font-body text-base text-muted leading-relaxed max-w-lg mx-auto">
            Each EZMAY piece is handcrafted with care and deserves to be preserved with the same attention.
            Follow these guidelines to keep your jewelry beautiful for years — and generations — to come.
          </p>
        </div>

        {/* Care sections */}
        <div className="space-y-12">
          {careGuide.map((section) => (
            <div key={section.title} className="border-t border-border pt-10">
              <h2 className="font-display text-2xl text-foreground mb-6">{section.title}</h2>
              <ul className="space-y-4">
                {section.content.map((point, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="font-body text-sm text-muted leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 pt-12 border-t border-border text-center">
          <p className="font-body text-sm text-muted mb-4">
            Have a specific question about caring for your piece?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-3 font-accent text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
          >
            Contact Us
          </a>
        </div>

      </div>
    </div>
  );
}
