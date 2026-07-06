// India-specific localization helpers: GST, pincode, and mobile number handling.
// Pure functions — safe to import from both server and client components.
//
// GST model: jewelry attracts 3% GST (1.5% CGST + 1.5% SGST). For B2C jewelry
// storefronts the convention is TAX-INCLUSIVE pricing — the price shown already
// contains GST, and we surface the tax component for transparency. The
// authoritative tax on the order is computed by Shopify checkout; these helpers
// are for on-storefront DISPLAY only.

export const GST_RATE = Number(process.env.NEXT_PUBLIC_GST_RATE ?? "0.03"); // 3%

/**
 * Given a tax-INCLUSIVE price (paise), return the embedded GST component (paise).
 * inclusive = base * (1 + rate)  =>  gst = inclusive - inclusive / (1 + rate)
 */
export function gstFromInclusive(inclusivePaise: number, rate = GST_RATE): number {
  return Math.round(inclusivePaise - inclusivePaise / (1 + rate));
}

/** Given a tax-EXCLUSIVE base price (paise), return the GST to add (paise). */
export function gstFromExclusive(basePaise: number, rate = GST_RATE): number {
  return Math.round(basePaise * rate);
}

/** Human label for the current GST rate, e.g. "3% GST". */
export function gstLabel(rate = GST_RATE): string {
  const pct = Number((rate * 100).toFixed(2));
  return `${pct}% GST`;
}

// Indian PIN codes: 6 digits, first digit 1–9.
const PINCODE_RE = /^[1-9][0-9]{5}$/;
export function isValidPincode(value: string): boolean {
  return PINCODE_RE.test(value.trim());
}

// Indian mobile: 10 digits starting 6–9, optional +91 / 0 prefix.
const MOBILE_RE = /^(?:\+?91|0)?[6-9]\d{9}$/;
export function isValidMobile(value: string): boolean {
  return MOBILE_RE.test(value.replace(/[\s-]/g, ""));
}

/** Normalize a mobile number to bare 10-digit national format (no country code). */
export function normalizeMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.slice(-10);
}

/** Format a 10-digit mobile for display, e.g. "98765 43210". */
export function formatMobile(value: string): string {
  const d = normalizeMobile(value);
  return d.length === 10 ? `${d.slice(0, 5)} ${d.slice(5)}` : value;
}
