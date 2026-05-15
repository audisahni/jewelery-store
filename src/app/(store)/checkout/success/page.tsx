import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="pt-24 pb-[120px] px-6">
      <div className="max-w-[560px] mx-auto text-center">
        <div className="flex justify-center mb-8">
          <CheckCircle className="text-primary" size={64} strokeWidth={1} />
        </div>
        <h1 className="font-display text-5xl text-foreground mb-4">Order Confirmed</h1>
        <p className="font-body text-muted mb-2">Thank you for your purchase.</p>
        <p className="font-body text-sm text-muted mb-12">
          A confirmation email has been sent to your inbox. We'll notify you when your order ships.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/shop"
            className="font-accent text-xs tracking-widest uppercase text-foreground border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
