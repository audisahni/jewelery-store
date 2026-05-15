"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const addressSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  address: z.string().min(1, "Address required"),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  zipCode: z.string().min(1, "ZIP required"),
  country: z.string().min(1, "Country required"),
});

type AddressValues = z.infer<typeof addressSchema>;

// --- CheckoutForm (inner, uses Stripe hooks) ---
function CheckoutForm({
  clientSecret,
  addressData,
  onSuccess,
}: {
  clientSecret: string;
  addressData: AddressValues;
  onSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: {
          billing_details: {
            name: `${addressData.firstName} ${addressData.lastName}`,
            email: addressData.email,
            address: {
              line1: addressData.address,
              city: addressData.city,
              state: addressData.state,
              postal_code: addressData.zipCode,
              country: addressData.country,
            },
          },
        },
      },
      redirect: "if_required",
    });

    setProcessing(false);

    if (error) {
      toast.error(error.message || "Payment failed. Please try again.");
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <Lock size={14} />
        {processing ? "Processing..." : "Complete Order"}
      </button>
    </form>
  );
}

// --- Main Checkout Page ---
export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<"address" | "payment">("address");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [addressData, setAddressData] = useState<AddressValues | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const shippingCost = subtotal() >= 50000 ? 0 : 2500; // free over $500
  const total = subtotal() + shippingCost;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "US", email: "", firstName: "", lastName: "", address: "", city: "", state: "", zipCode: "" },
  });

  const onAddressSubmit = async (values: AddressValues) => {
    setLoadingPayment(true);
    setAddressData(values);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.primaryImage,
          })),
          subtotal: subtotal(),
          shipping: shippingCost,
          total,
          customerEmail: values.email,
          customerName: `${values.firstName} ${values.lastName}`,
          shippingAddress: {
            line1: values.address,
            city: values.city,
            state: values.state,
            postal_code: values.zipCode,
            country: values.country,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment");

      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!addressData) return;

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stripePaymentIntentId: paymentIntentId,
        customerEmail: addressData.email,
        customerName: `${addressData.firstName} ${addressData.lastName}`,
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.primaryImage,
        })),
        subtotal: subtotal(),
        shipping: shippingCost,
        total,
        shippingAddress: {
          line1: addressData.address,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.zipCode,
          country: addressData.country,
        },
      }),
    });

    clearCart();
    router.push(`/checkout/success?payment_intent=${paymentIntentId}`);
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-[120px] px-6 text-center">
        <h1 className="font-display text-5xl text-foreground mb-6">Your cart is empty</h1>
        <Link
          href="/shop"
          className="font-accent text-xs tracking-widest uppercase text-primary border-b border-primary pb-1"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-[120px] px-6">
      <div className="max-w-[1320px] mx-auto">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-muted font-accent text-xs tracking-widest uppercase mb-10 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
          {/* Left: Form */}
          <div>
            <h1 className="font-display text-4xl text-foreground mb-10">Checkout</h1>

            {step === "address" && (
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-6">
                <div>
                  <h2 className="font-accent text-xs tracking-[0.2em] uppercase text-foreground mb-6 pb-3 border-b border-border">
                    Contact
                  </h2>
                  <div>
                    <label className="block text-xs text-muted mb-1 font-accent tracking-wider uppercase">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="font-accent text-xs tracking-[0.2em] uppercase text-foreground mb-6 pb-3 border-b border-border">
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted mb-1 font-accent tracking-wider uppercase">
                          First Name
                        </label>
                        <input
                          {...register("firstName")}
                          className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
                          placeholder="Jane"
                        />
                        {errors.firstName && (
                          <p className="text-destructive text-xs mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1 font-accent tracking-wider uppercase">
                          Last Name
                        </label>
                        <input
                          {...register("lastName")}
                          className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
                          placeholder="Smith"
                        />
                        {errors.lastName && (
                          <p className="text-destructive text-xs mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1 font-accent tracking-wider uppercase">
                        Address
                      </label>
                      <input
                        {...register("address")}
                        className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
                        placeholder="123 Main Street"
                      />
                      {errors.address && (
                        <p className="text-destructive text-xs mt-1">{errors.address.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-muted mb-1 font-accent tracking-wider uppercase">
                          City
                        </label>
                        <input
                          {...register("city")}
                          className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
                          placeholder="New York"
                        />
                        {errors.city && (
                          <p className="text-destructive text-xs mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1 font-accent tracking-wider uppercase">
                          State
                        </label>
                        <input
                          {...register("state")}
                          className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
                          placeholder="NY"
                        />
                        {errors.state && (
                          <p className="text-destructive text-xs mt-1">{errors.state.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1 font-accent tracking-wider uppercase">
                          ZIP
                        </label>
                        <input
                          {...register("zipCode")}
                          className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
                          placeholder="10001"
                        />
                        {errors.zipCode && (
                          <p className="text-destructive text-xs mt-1">{errors.zipCode.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingPayment}
                  className="w-full bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary transition-colors duration-300 disabled:opacity-50"
                >
                  {loadingPayment ? "Loading..." : "Continue to Payment"}
                </button>
              </form>
            )}

            {step === "payment" && clientSecret && addressData && (
              <div>
                <button
                  onClick={() => setStep("address")}
                  className="flex items-center gap-2 text-muted text-xs font-accent tracking-wider uppercase mb-8 hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={12} />
                  Edit Address
                </button>
                <h2 className="font-accent text-xs tracking-[0.2em] uppercase text-foreground mb-6 pb-3 border-b border-border">
                  Payment
                </h2>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#C9A84C",
                        fontFamily: "DM Sans, sans-serif",
                        borderRadius: "0px",
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    clientSecret={clientSecret}
                    addressData={addressData}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="bg-secondary p-8">
            <h2 className="font-accent text-xs tracking-[0.2em] uppercase text-foreground mb-8 pb-3 border-b border-border">
              Order Summary
            </h2>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="relative size-16 bg-background rounded overflow-hidden shrink-0">
                    {item.product.primaryImage && (
                      <Image
                        src={item.product.primaryImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    <span className="absolute -top-1.5 -right-1.5 size-5 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center font-body">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-foreground truncate">{item.product.name}</p>
                    {item.product.material && (
                      <p className="font-body text-xs text-muted">{item.product.material}</p>
                    )}
                  </div>
                  <p className="font-display text-sm text-foreground shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-display text-lg pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
