import { db, teams, teamCategories, categories } from "@/lib/db";
import { desc, eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const allTeams = await db.select().from(teams).orderBy(desc(teams.createdAt));

    if (allTeams.length === 0) return NextResponse.json([]);

    const teamIds = allTeams.map(t => t.id);

    const mappings = await db.select({
      teamId: teamCategories.teamId,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug
      }
    })
    .from(teamCategories)
    .innerJoin(categories, eq(teamCategories.categoryId, categories.id))
    .where(inArray(teamCategories.teamId, teamIds));

    const teamCatsMap = new Map();
    mappings.forEach(m => {
      if (!teamCatsMap.has(m.teamId)) teamCatsMap.set(m.teamId, []);
      teamCatsMap.get(m.teamId).push({ category: m.category });
    });

    let data = allTeams.map(t => ({
      ...t,
      teamCategories: teamCatsMap.get(t.id) || []
    }));

    if (category) {
      data = data.filter((t) => 
        t.category === category || 
        t.teamCategories?.some((tc: any) => tc.category?.name === category || tc.category?.slug === category)
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_TEAMS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
