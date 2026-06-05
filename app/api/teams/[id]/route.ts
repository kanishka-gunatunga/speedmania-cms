import { NextResponse } from "next/server";
import { db, teams, drivers } from "@/lib/db";
import { eq, or } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return new NextResponse("ID or Slug is required", { status: 400 });
    }

    const team = await db.query.teams.findFirst({
      where: or(
        eq(teams.slug, id),
        eq(teams.id, id)
      ),
    });

    if (!team) {
      return new NextResponse("Team not found", { status: 404 });
    }

    // 1. Get drivers associated with this team
    const teamDrivers = await db
      .select()
      .from(drivers)
      .where(eq(drivers.teamId, team.id));

    const driverRoster = teamDrivers.map((d) => ({
      name: d.fullName,
      role: d.playerType === "rider" ? "Rider" : "Driver",
      image: d.image || "/fallback-driver.webp",
    }));

    // 2. Get custom roster
    let customRoster = [];
    if (team.roster) {
      try {
        customRoster = JSON.parse(team.roster);
      } catch (e) {
        console.error("Failed to parse custom roster", e);
      }
    }

    // 3. Combine rosters
    const roster = [...driverRoster, ...customRoster];

    // 4. Format statistics & summary to match the frontend expectations
    const teamDetail = {
      ...team,
      stats: {
        position: team.seasonPosition || "N/A",
        points: String(team.seasonPoints ?? 0),
        races: String(team.races ?? 0),
        wins: String(team.wins ?? 0),
        fastestLaps: String(team.fastestLaps ?? 0),
        podiums: String(team.podiums ?? 0),
        sprintRaces: String(team.sprintRaces ?? 0),
        sprintPoints: String(team.sprintPoints ?? 0),
        sprintWins: String(team.sprintWins ?? 0),
        sprintPodiums: String(team.sprintPodiums ?? 0),
      },
      summary: {
        entered: String(team.summaryEntered ?? 0),
        wins: team.summaryWins || "0",
        highestFinish: team.highestFinish || "N/A",
        podiums: String(team.summaryPodiums ?? 0),
        poles: String(team.summaryPoles ?? 0),
        championships: String(team.summaryChampionships ?? 0),
      },
      roster,
    };

    return NextResponse.json(teamDetail);
  } catch (error) {
    console.error("[TEAM_GET_DETAIL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
