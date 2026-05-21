import { db, drivers } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const data = await db.query.drivers.findFirst({
      where: and(
        eq(drivers.slug, resolvedParams.slug),
        eq(drivers.status, "approved")
      ),
      with: {
        achievements: true,
        riderStats: true,
      },
    });

    if (!data) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_DRIVER_SLUG_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
