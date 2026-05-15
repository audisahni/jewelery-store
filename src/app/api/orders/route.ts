import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const runtime = "edge";

const createOrderSchema = z.object({
  stripePaymentIntentId: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string().optional(),
  })),
  subtotal: z.number(),
  shipping: z.number(),
  total: z.number(),
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
});

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

export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const body = await req.json();
    const data = createOrderSchema.parse(body);

    const id = crypto.randomUUID();
    await db.insert(orders).values({
      id,
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const { id, status, trackingNumber } = await req.json();

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;

    await db.update(orders).set(updates).where(eq(orders.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
