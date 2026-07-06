import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const email = searchParams.get("email");

    const result = await db.select().from(orders).orderBy(desc(orders.createdAt));

    let filtered = result;
    if (status) filtered = filtered.filter(o => o.status === status);
    if (email) filtered = filtered.filter(o => o.customerEmail?.includes(email));

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// Orders are created by Shopify and mirrored into D1 via the Shopify webhook
// (see /api/shopify/webhook). The storefront no longer creates orders directly.
export async function POST() {
  return NextResponse.json(
    { error: "Orders are created via Shopify checkout, not this endpoint." },
    { status: 405 },
  );
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const { id, status, trackingNumber } = (await req.json()) as {
      id?: string;
      status?: string;
      trackingNumber?: string;
    };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;

    await db.update(orders).set(updates).where(eq(orders.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
