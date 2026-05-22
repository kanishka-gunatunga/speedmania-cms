import { db, drivers, riderStats } from "@/lib/db";
import { desc, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        firstName: drivers.firstName,
        lastName: drivers.lastName,
        slug: drivers.slug,
        racingCategory: drivers.racingCategory,
        currentTeam: drivers.currentTeam,
        teamColor: drivers.teamColor,
        accessibleColor: drivers.accessibleColor,
        number: drivers.number,
        image: drivers.image,
        numberImage: drivers.numberImage,
        flagCode: drivers.flagCode,
        country: drivers.country,
        vehicleModel: drivers.vehicleModel,
        bestCareerFinish: drivers.bestCareerFinish,
        totalRaces: drivers.totalRaces,
        totalWins: drivers.totalWins,
        totalPodiums: drivers.totalPodiums,
        championshipsWon: drivers.championshipsWon,
        createdAt: drivers.createdAt,
        points: riderStats.points,
        position: riderStats.position,
      })
      .from(drivers)
      .leftJoin(
        riderStats,
        and(
          eq(drivers.id, riderStats.driverId),
          eq(riderStats.season, 2026)
        )
      )
      .where(eq(drivers.status, "approved"))
      .orderBy(desc(riderStats.points));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_DRIVERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}
