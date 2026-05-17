import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Exchanges | EZMAY By Gurleen",
  description: "Our returns and exchange policy for EZMAY By Gurleen handcrafted Indian jewelry.",
};

const faqs = [
  {
    q: "What items are eligible for return?",
    a: "Unworn, undamaged pieces in their original packaging and with all original tags intact are eligible for return within 30 days of delivery. The piece must be in exactly the condition it was received.",
  },
  {
    q: "Are custom or made-to-order pieces returnable?",
    a: "Custom and made-to-order pieces are crafted exclusively for you and cannot be returned or exchanged unless they arrive damaged or with a manufacturing defect. Please review all specifications carefully before placing a custom order.",
  },
  {
    q: "How do I initiate a return or exchange?",
    a: "Please contact us via WhatsApp or email within 30 days of receiving your order. Share your order details and the reason for your return. Our team will guide you through the process and arrange a pickup or courier.",
  },
  {
    q: "Who bears the cost of return shipping?",
    a: "For returns due to a defect or our error, we will cover all shipping costs. For change-of-mind returns, return shipping charges are borne by the customer.",
  },
  {
    q: "How long does a refund take?",
    a: "Once we receive and inspect the returned piece (typically 2–3 business days), refunds are processed to the original payment method within 5–7 business days. Bank processing times may vary.",
  },
  {
    q: "Can I exchange for a different piece?",
    a: "Yes. If the piece you received is eligible for return, you may exchange it for another piece of equal or greater value (with any difference paid). Please contact us to arrange this.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="pt-32 pb-[120px] px-6">
      <div className="max-w-[760px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-accent text-xs tracking-[0.3em] uppercase text-muted mb-4">Our Policy</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-6">Returns &amp; Exchanges</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="font-body text-base text-muted leading-relaxed max-w-lg mx-auto">
            We want you to love your EZMAY piece completely. If something is not right, we are here to help.
          </p>
        </div>

        {/* Policy summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            { label: "Return Window", value: "30 Days", note: "From date of delivery" },
            { label: "Condition", value: "Unworn", note: "Original packaging required" },
            { label: "Refund Timeline", value: "5–7 Days", note: "After inspection" },
          ].map((item) => (
            <div key={item.label} className="border border-border p-6 text-center">
              <p className="font-accent text-[10px] tracking-widest uppercase text-muted mb-2">{item.label}</p>
              <p className="font-display text-2xl text-foreground mb-1">{item.value}</p>
              <p className="font-body text-xs text-muted">{item.note}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          <h2 className="font-display text-2xl text-foreground">Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <div key={i} className="border-t border-border pt-6">
              <h3 className="font-body text-base font-medium text-foreground mb-3">{faq.q}</h3>
              <p className="font-body text-sm text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-16 pt-12 border-t border-border text-center">
          <p className="font-body text-sm text-muted mb-4">
            Still have questions? We respond to all enquiries within one business day.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 font-accent text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
          >
            Get in Touch
          </Link>
        </div>

      </div>
    </div>
  );
}
