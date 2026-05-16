import { Metadata } from "next";
import { getStoreSettings } from "@/lib/data";
import Cart from "@/components/store/Cart";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Your Cart | EZMAY By Gurleen",
};

export default async function CartPage() {
  const settings = await getStoreSettings();
  const ecommerceEnabled = settings.ecommerceEnabled === "true";

  if (!ecommerceEnabled) {
    const whatsappNumber = settings.whatsappNumber ?? "";
    const whatsappLink = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Namaste! I'm interested in a piece from EZMAY By Gurleen. Could you please help me?")}`
      : null;

    return (
      <div className="pt-24 pb-[120px] px-6 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6">
          <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted">EZMAY By Gurleen</p>
          <h1 className="font-display text-4xl text-foreground">Online Shopping Coming Soon</h1>
          <div className="w-12 h-px bg-primary mx-auto" />
          <p className="font-body text-base text-muted leading-relaxed">
            We are currently focused on showcasing our collection. To enquire about a piece or
            place a custom order, please reach out to us directly — we&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-accent text-xs tracking-widest uppercase px-8 py-3 hover:bg-[#20b958] transition-colors"
              >
                <MessageCircle size={14} />
                Enquire on WhatsApp
              </a>
            )}
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 border border-foreground text-foreground font-accent text-xs tracking-widest uppercase px-8 py-3 hover:bg-foreground hover:text-background transition-colors"
            >
              View Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-[120px] px-6">
      <div className="max-w-[1320px] mx-auto">
        <h1 className="font-display text-5xl text-foreground mb-12">Your Cart</h1>
        <Cart />
      </div>
    </div>
  );
}
