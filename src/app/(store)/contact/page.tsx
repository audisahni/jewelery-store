import { Metadata } from "next";
import { getStoreSettings } from "@/lib/data";
import { MessageCircle, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | EZMAY By Gurleen",
  description: "Get in touch with EZMAY By Gurleen. Enquire about pieces, custom orders, or anything else.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsappNumber = settings.whatsappNumber ?? "";
  const contactEmail = settings.contactEmail ?? "";

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Namaste! I'd like to enquire about EZMAY By Gurleen jewelry.")}`
    : null;

  return (
    <div className="pt-32 pb-[120px] px-6">
      <div className="max-w-[760px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-4">Reach Out</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">Contact Us</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="font-body text-base text-muted leading-relaxed max-w-md mx-auto">
            We love hearing from you — whether you have a question about a specific piece, would like to discuss
            a custom order, or simply want to know more about our craft.
          </p>
        </div>

        {/* Contact options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-4 border border-border p-8 hover:border-primary hover:text-primary transition-colors group text-center"
            >
              <MessageCircle size={28} className="text-[#25D366]" />
              <div>
                <p className="font-accent text-xs tracking-widest uppercase text-foreground mb-1">WhatsApp</p>
                <p className="font-body text-sm text-muted group-hover:text-primary transition-colors">
                  Chat with us directly
                </p>
                {whatsappNumber && (
                  <p className="font-body text-xs text-muted mt-1">{whatsappNumber}</p>
                )}
              </div>
            </a>
          )}

          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex flex-col items-center gap-4 border border-border p-8 hover:border-primary hover:text-primary transition-colors group text-center"
            >
              <Mail size={28} className="text-muted group-hover:text-primary transition-colors" />
              <div>
                <p className="font-accent text-xs tracking-widest uppercase text-foreground mb-1">Email</p>
                <p className="font-body text-sm text-muted group-hover:text-primary transition-colors break-all">
                  {contactEmail}
                </p>
              </div>
            </a>
          )}

          <div className="flex flex-col items-center gap-4 border border-border p-8 text-center">
            <MapPin size={28} className="text-muted" />
            <div>
              <p className="font-accent text-xs tracking-widest uppercase text-foreground mb-1">Studio</p>
              <p className="font-body text-sm text-muted">New Delhi, India</p>
              <p className="font-body text-xs text-muted mt-1">By appointment</p>
            </div>
          </div>
        </div>

        {/* What we can help with */}
        <div className="border-t border-border pt-12">
          <h2 className="font-display text-2xl text-foreground mb-8 text-center">How We Can Help</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Piece Enquiries",
                desc: "Questions about a specific piece in our collection — materials, sizing, availability, or any other details.",
              },
              {
                title: "Custom Orders",
                desc: "Looking for something made just for you? Gurleen personally works on bespoke commissions for special occasions.",
              },
              {
                title: "Gifting",
                desc: "Need help selecting the right piece as a gift? We offer personalised recommendations and gift packaging.",
              },
              {
                title: "Repairs & Care",
                desc: "If your EZMAY piece needs attention, reach out and we will guide you through the best course of action.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="font-body text-sm font-medium text-foreground">{item.title}</h3>
                <p className="font-body text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Response time */}
        <div className="mt-16 pt-12 border-t border-border text-center">
          <p className="font-body text-sm text-muted">
            We respond to all enquiries within <strong className="text-foreground">one business day</strong>.
            Our studio hours are Monday to Saturday, 10 AM – 6 PM IST.
          </p>
        </div>

      </div>
    </div>
  );
}
