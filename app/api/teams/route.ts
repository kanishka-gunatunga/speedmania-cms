import { db, teams } from "@/lib/db";
import { desc, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const whereConditions = [];
    if (category) {
      whereConditions.push(eq(teams.category, category));
    }

    const data = await db
      .select()
      .from(teams)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(teams.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_TEAMS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
