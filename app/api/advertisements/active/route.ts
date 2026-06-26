import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { advertisements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.isActive, true))
      .limit(1);

    return NextResponse.json(data[0] || null);
  } catch (error) {
    console.error("Error fetching active advertisement:", error);
    return NextResponse.json({ error: "Failed to fetch advertisement" }, { status: 500 });
  }
}
