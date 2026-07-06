import { NextResponse } from "next/server";
import { checkServiceability, ShiprocketError } from "@/lib/shiprocket";
import { isValidPincode } from "@/lib/india";

// POST { pincode: string, weightKg?: number, cod?: boolean }
// -> serviceability + ETA for the product page delivery checker.
export async function POST(req: Request) {
  let body: { pincode?: string; weightKg?: number; cod?: boolean };
  try {
    body = (await req.json()) as { pincode?: string; weightKg?: number; cod?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pincode = (body.pincode ?? "").trim();
  if (!isValidPincode(pincode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit PIN code" }, { status: 400 });
  }

  try {
    const result = await checkServiceability(pincode, {
      weightKg: body.weightKg,
      cod: body.cod,
    });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof ShiprocketError ? err.status : 502;
    // Never leak credentials/config detail to the client.
    const message =
      status === 500
        ? "Delivery checking is temporarily unavailable."
        : "Could not check delivery for this PIN code. Please try again.";
    console.error("serviceability error:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
