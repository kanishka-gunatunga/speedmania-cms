import { db, drivers, riderStats } from "@/lib/db";
import { desc, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const season = parseInt(searchParams.get("season") || "2026");
    
    let category = searchParams.get("category");
    if (!category) {
      category = type === "rider" ? "MotoGP" : "Formula 1";
    }

    const whereConditions = [eq(drivers.status, "approved")];
    if (type === "driver" || type === "rider") {
      whereConditions.push(eq(drivers.playerType, type));
    }

    if (category) {
      whereConditions.push(eq(drivers.racingCategory, category));
    }

    const data = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        firstName: drivers.firstName,
        lastName: drivers.lastName,
        slug: drivers.slug,
        playerType: drivers.playerType,
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
        careerPoints: drivers.careerPoints,
        careerPoles: drivers.careerPoles,
        biography: drivers.biography,
        createdAt: drivers.createdAt,
        points: riderStats.points,
        position: riderStats.position,
      })
      .from(drivers)
      .leftJoin(
        riderStats,
        and(
          eq(drivers.id, riderStats.driverId),
          eq(riderStats.season, season),
          eq(riderStats.category, category)
        )
      )
      .where(and(...whereConditions))
      .orderBy(desc(riderStats.points));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_DRIVERS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}
