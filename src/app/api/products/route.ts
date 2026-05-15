import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";


const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).nullable().optional(),
  category: z.string().optional(),
  material: z.string().optional(),
  images: z.array(z.string()).optional(),
  primaryImage: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  weight: z.number().optional(),
});

export async function GET(req: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const activeOnly = searchParams.get("active") !== "false";

    let result = await db.select().from(products).orderBy(desc(products.createdAt));

    if (slug) result = result.filter(p => p.slug === slug);
    if (category) result = result.filter(p => p.category === category);
    if (featured === "true") result = result.filter(p => p.featured);
    if (activeOnly) result = result.filter(p => p.active);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const body = await req.json();
    const data = productSchema.parse(body);
    const id = crypto.randomUUID();

    await db.insert(products).values({
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.update(products).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
