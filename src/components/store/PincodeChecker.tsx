"use client";

import { useState } from "react";
import { Truck, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidPincode } from "@/lib/india";
import type { ServiceabilityResult } from "@/lib/shiprocket";

// Pre-checkout delivery estimator. Hits our /api/shiprocket/serviceability edge
// route (which talks to Shiprocket) to tell the customer, before they commit,
// whether we deliver to their PIN code and how long it will take.
export default function PincodeChecker({ weightKg }: { weightKg?: number }) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!isValidPincode(pincode)) {
      setError("Enter a valid 6-digit PIN code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/shiprocket/serviceability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: pincode.trim(), weightKg }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) {
        setError(data.error || "Could not check delivery");
      } else {
        setResult(data as ServiceabilityResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-accent text-[10px] tracking-widest uppercase text-muted flex items-center gap-2">
        <Truck size={13} /> Check delivery
      </p>
      <form onSubmit={check} className="flex items-stretch gap-2 max-w-sm">
        <input
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter PIN code"
          className="flex-1 border border-border px-4 py-2.5 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent tabular-nums"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-foreground text-background font-accent text-[10px] tracking-[0.2em] uppercase hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Check"}
        </button>
      </form>

      {error && <p className="font-body text-xs text-destructive">{error}</p>}

      {result && (
        <div
          className={cn(
            "font-body text-sm flex items-start gap-2",
            result.serviceable ? "text-foreground/80" : "text-destructive"
          )}
        >
          {result.serviceable ? (
            <Check size={15} className="text-green-600 mt-0.5 shrink-0" />
          ) : (
            <X size={15} className="mt-0.5 shrink-0" />
          )}
          <span>
            {result.serviceable ? (
              <>
                Delivers to <strong>{result.pincode}</strong>
                {result.estimatedDays
                  ? ` in ~${result.estimatedDays} day${result.estimatedDays > 1 ? "s" : ""}`
                  : ""}
                {result.etd ? ` (by ${result.etd})` : ""}.
                {result.cod ? " Cash on delivery available." : ""}
              </>
            ) : (
              <>Sorry, we don&apos;t deliver to {result.pincode} yet.</>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
