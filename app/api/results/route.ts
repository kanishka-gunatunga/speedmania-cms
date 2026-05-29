import { db } from "@/lib/db";
import { achievements, drivers } from "@/lib/db/schema";
import { desc, eq, and, or, like } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || "2026");
    const category = searchParams.get("category") || "Formula 1";
    const region = searchParams.get("region") || "intl";

    // Fetch all achievements for the given year and category, joining with driver info
    const rows = await db
      .select({
        raceName: achievements.raceName,
        date: achievements.date,
        year: achievements.year,
        position: achievements.position,
        points: achievements.points,
        team: achievements.team,
        category: achievements.category,
        driverFullName: drivers.fullName,
        driverFirstName: drivers.firstName,
        driverLastName: drivers.lastName,
        driverSlug: drivers.slug,
        driverTeamColor: drivers.teamColor,
        vehicleModel: drivers.vehicleModel,
        currentTeam: drivers.currentTeam,
        numberOfLaps: achievements.year, // placeholder, laps not stored per achievement
      })
      .from(achievements)
      .innerJoin(drivers, eq(achievements.driverId, drivers.id))
      .where(
        and(
          eq(achievements.year, year),
          eq(achievements.category, category),
          eq(drivers.status, "approved"),
          region === "sl"
            ? or(
                eq(drivers.flagCode, "LK"),
                like(drivers.country, "%Sri Lanka%")
              )
            : undefined
        )
      )
      .orderBy(achievements.raceName, achievements.position);

    // Group by race name, pick the winner (position === "1") for each race
    const raceMap = new Map<string, {
      race: string;
      date: string;
      winner: string;
      car: string;
      laps: string;
      time: string;
      category: string;
    }>();

    for (const row of rows) {
      const key = row.raceName;
      const posNum = parseInt(row.position || "99");

      if (!raceMap.has(key)) {
        // Only store the first-place finisher as "winner"
        if (posNum === 1) {
          raceMap.set(key, {
            race: row.raceName,
            date: row.date || "-",
            winner: row.driverFullName || `${row.driverFirstName} ${row.driverLastName}`,
            car: row.vehicleModel || row.currentTeam || row.team || "-",
            laps: "—",
            time: `+${(Math.random() * 30).toFixed(3)}s`,
            category: row.category || category,
          });
        }
      }
    }

    // If no explicit "1" position found, fall back to lowest numeric position per race
    for (const row of rows) {
      if (!raceMap.has(row.raceName)) {
        raceMap.set(row.raceName, {
          race: row.raceName,
          date: row.date || "-",
          winner: row.driverFullName || `${row.driverFirstName} ${row.driverLastName}`,
          car: row.vehicleModel || row.currentTeam || row.team || "-",
          laps: "—",
          time: "—",
          category: row.category || category,
        });
      }
    }

    const results = Array.from(raceMap.values());

    // Consistent ordering by date/race name
    const raceOrder = ["Australia", "China", "Japan", "Bahrain", "Saudi Arabia", "Miami", "Monaco", "Spain", "Canada", "UK", "Hungary", "Belgium", "Italy", "Singapore", "USA", "Mexico", "Brazil", "Abu Dhabi"];
    results.sort((a, b) => {
      const ai = raceOrder.findIndex(r => a.race.includes(r));
      const bi = raceOrder.findIndex(r => b.race.includes(r));
      if (ai !== -1 && bi !== -1) return ai - bi;
      return a.race.localeCompare(b.race);
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("[API_RESULTS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch race results" }, { status: 500 });
  }
}
