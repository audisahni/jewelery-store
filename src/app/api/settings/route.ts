import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const allSettings = await db.select().from(settings);

    const settingsMap = allSettings.reduce(
      (acc, s) => {
        if (s.key && s.value) acc[s.key] = s.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return NextResponse.json(settingsMap);
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await db
          .insert(settings)
          .values({ key, value })
          .onConflictDoUpdate({ target: settings.key, set: { value } });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
