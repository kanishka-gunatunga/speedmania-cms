import { db, drivers } from "@/lib/db";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        slug: drivers.slug,
        racingCategory: drivers.racingCategory,
        currentTeam: drivers.currentTeam,
        vehicleModel: drivers.vehicleModel,
        bestCareerFinish: drivers.bestCareerFinish,
        createdAt: drivers.createdAt,
      })
      .from(drivers)
      .orderBy(desc(drivers.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_DRIVERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}
