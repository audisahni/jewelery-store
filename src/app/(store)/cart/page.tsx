import Cart from "@/components/store/Cart";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart | Lumière",
};

export default function CartPage() {
  return (
    <div className="pt-24 pb-[120px] px-6">
      <div className="max-w-[1320px] mx-auto">
        <h1 className="font-display text-5xl text-foreground mb-12">Your Cart</h1>
        <Cart />
      </div>
    </div>
  );
}
