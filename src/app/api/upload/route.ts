import { NextResponse } from "next/server";
import { generatePresignedUrl } from "@/lib/r2";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { presignedUrl, publicUrl } = await generatePresignedUrl(filename, contentType);

    return NextResponse.json({ presignedUrl, publicUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}