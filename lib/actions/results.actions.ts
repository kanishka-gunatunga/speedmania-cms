"use server";

import { revalidatePath } from "next/cache";
import { db, achievements, riderStats, drivers } from "@/lib/db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// ──────────────────────────────────────────
// Helper: Drivers for Dropdowns
// ──────────────────────────────────────────
export async function getDriversForSelect() {
  try {
    const list = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        racingCategory: drivers.racingCategory,
        playerType: drivers.playerType,
        currentTeam: drivers.currentTeam,
        flagCode: drivers.flagCode,
        country: drivers.country,
        status: drivers.status,
      })
      .from(drivers)
      .where(eq(drivers.status, "approved"))
      .orderBy(asc(drivers.fullName));
    return list;
  } catch (error) {
    console.error("Error fetching drivers for select:", error);
    throw new Error("Failed to fetch drivers list");
  }
}

// ──────────────────────────────────────────
// Achievements (Race Results) Actions
// ──────────────────────────────────────────

export async function getAchievements(filters: { year?: number; category?: string } = {}, page: number = 1, limit: number = 10) {
  try {
    const conditions = [];
    if (filters.year) {
      conditions.push(eq(achievements.year, filters.year));
    }
    if (filters.category) {
      conditions.push(eq(achievements.category, filters.category));
    }

    const query = db
      .select({
        id: achievements.id,
        driverId: achievements.driverId,
        raceName: achievements.raceName,
        year: achievements.year,
        date: achievements.date,
        team: achievements.team,
        position: achievements.position,
        points: achievements.points,
        category: achievements.category,
        driverName: drivers.fullName,
        driverSlug: drivers.slug,
      })
      .from(achievements)
      .leftJoin(drivers, eq(achievements.driverId, drivers.id));

    let countQuery = db.select({ count: sql<number>`count(*)` }).from(achievements);
    if (conditions.length > 0) {
      query.where(and(...conditions));
      countQuery.where(and(...conditions));
    }

    const offset = (page - 1) * limit;

    const [results, [{ count }]] = await Promise.all([
      query.orderBy(desc(achievements.year), achievements.raceName, achievements.position).limit(limit).offset(offset),
      countQuery
    ]);

    return { achievements: results, total: Number(count) };
  } catch (error) {
    console.error("Error fetching achievements:", error);
    throw new Error("Failed to fetch achievements");
  }
}

export async function createAchievement(data: {
  driverId: string;
  raceName: string;
  year: number;
  date?: string;
  team?: string;
  position: string;
  points: number;
  category: string;
}) {
  try {
    const id = crypto.randomUUID();
    await db.insert(achievements).values({
      id,
      driverId: data.driverId,
      raceName: data.raceName,
      year: data.year ? parseInt(data.year.toString()) : 2026,
      date: data.date || null,
      team: data.team || null,
      position: data.position || "1",
      points: data.points ? parseInt(data.points.toString()) : 0,
      category: data.category || "Formula 1",
    });

    revalidatePath("/admin/results");
    revalidatePath("/api/results");
    return { success: true, id };
  } catch (error: any) {
    console.error("Error creating achievement:", error);
    return { success: false, error: error?.message || "Failed to create race result." };
  }
}

export async function updateAchievement(
  id: string,
  data: {
    driverId: string;
    raceName: string;
    year: number;
    date?: string;
    team?: string;
    position: string;
    points: number;
    category: string;
  }
) {
  try {
    await db
      .update(achievements)
      .set({
        driverId: data.driverId,
        raceName: data.raceName,
        year: data.year ? parseInt(data.year.toString()) : 2026,
        date: data.date || null,
        team: data.team || null,
        position: data.position || "1",
        points: data.points ? parseInt(data.points.toString()) : 0,
        category: data.category || "Formula 1",
      })
      .where(eq(achievements.id, id));

    revalidatePath("/admin/results");
    revalidatePath("/api/results");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating achievement:", error);
    return { success: false, error: error?.message || "Failed to update race result." };
  }
}

export async function deleteAchievement(id: string) {
  try {
    await db.delete(achievements).where(eq(achievements.id, id));
    revalidatePath("/admin/results");
    revalidatePath("/api/results");
    return { success: true };
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return { success: false, error: "Failed to delete race result." };
  }
}

// ──────────────────────────────────────────
// Rider Stats (Driver Standings Stats) Actions
// ──────────────────────────────────────────

export async function getRiderStats(filters: { season?: number; category?: string } = {}, page: number = 1, limit: number = 10) {
  try {
    const conditions = [];
    if (filters.season) {
      conditions.push(eq(riderStats.season, filters.season));
    }
    if (filters.category) {
      conditions.push(eq(riderStats.category, filters.category));
    }

    const query = db
      .select({
        id: riderStats.id,
        driverId: riderStats.driverId,
        season: riderStats.season,
        category: riderStats.category,
        bike: riderStats.bike,
        starts: riderStats.starts,
        poles: riderStats.poles,
        firstPos: riderStats.firstPos,
        secondPos: riderStats.secondPos,
        thirdPos: riderStats.thirdPos,
        podiums: riderStats.podiums,
        points: riderStats.points,
        position: riderStats.position,
        fastestLaps: riderStats.fastestLaps,
        dnfs: riderStats.dnfs,
        driverName: drivers.fullName,
        driverSlug: drivers.slug,
      })
      .from(riderStats)
      .leftJoin(drivers, eq(riderStats.driverId, drivers.id));

    let countQuery = db.select({ count: sql<number>`count(*)` }).from(riderStats);
    if (conditions.length > 0) {
      query.where(and(...conditions));
      countQuery.where(and(...conditions));
    }

    const offset = (page - 1) * limit;

    const [results, [{ count }]] = await Promise.all([
      query.orderBy(desc(riderStats.season), desc(riderStats.points)).limit(limit).offset(offset),
      countQuery
    ]);

    return { riderStats: results, total: Number(count) };
  } catch (error) {
    console.error("Error fetching rider stats:", error);
    throw new Error("Failed to fetch standings stats");
  }
}

export async function createRiderStat(data: {
  driverId: string;
  season: number;
  category: string;
  bike?: string;
  starts?: number;
  poles?: number;
  firstPos?: number;
  secondPos?: number;
  thirdPos?: number;
  podiums?: number;
  points: number;
  position?: string;
  fastestLaps?: number;
  dnfs?: number;
}) {
  try {
    const id = crypto.randomUUID();
    await db.insert(riderStats).values({
      id,
      driverId: data.driverId,
      season: data.season ? parseInt(data.season.toString()) : 2026,
      category: data.category || "Formula 1",
      bike: data.bike || null,
      starts: data.starts ? parseInt(data.starts.toString()) : 0,
      poles: data.poles ? parseInt(data.poles.toString()) : 0,
      firstPos: data.firstPos ? parseInt(data.firstPos.toString()) : 0,
      secondPos: data.secondPos ? parseInt(data.secondPos.toString()) : 0,
      thirdPos: data.thirdPos ? parseInt(data.thirdPos.toString()) : 0,
      podiums: data.podiums ? parseInt(data.podiums.toString()) : 0,
      points: data.points ? parseInt(data.points.toString()) : 0,
      position: data.position || null,
      fastestLaps: data.fastestLaps ? parseInt(data.fastestLaps.toString()) : 0,
      dnfs: data.dnfs ? parseInt(data.dnfs.toString()) : 0,
    });

    revalidatePath("/admin/results");
    revalidatePath("/api/drivers");
    return { success: true, id };
  } catch (error: any) {
    console.error("Error creating rider stat:", error);
    return { success: false, error: error?.message || "Failed to create standings statistics." };
  }
}

export async function updateRiderStat(
  id: string,
  data: {
    driverId: string;
    season: number;
    category: string;
    bike?: string;
    starts?: number;
    poles?: number;
    firstPos?: number;
    secondPos?: number;
    thirdPos?: number;
    podiums?: number;
    points: number;
    position?: string;
    fastestLaps?: number;
    dnfs?: number;
  }
) {
  try {
    await db
      .update(riderStats)
      .set({
        driverId: data.driverId,
        season: data.season ? parseInt(data.season.toString()) : 2026,
        category: data.category || "Formula 1",
        bike: data.bike || null,
        starts: data.starts ? parseInt(data.starts.toString()) : 0,
        poles: data.poles ? parseInt(data.poles.toString()) : 0,
        firstPos: data.firstPos ? parseInt(data.firstPos.toString()) : 0,
        secondPos: data.secondPos ? parseInt(data.secondPos.toString()) : 0,
        thirdPos: data.thirdPos ? parseInt(data.thirdPos.toString()) : 0,
        podiums: data.podiums ? parseInt(data.podiums.toString()) : 0,
        points: data.points ? parseInt(data.points.toString()) : 0,
        position: data.position || null,
        fastestLaps: data.fastestLaps ? parseInt(data.fastestLaps.toString()) : 0,
        dnfs: data.dnfs ? parseInt(data.dnfs.toString()) : 0,
      })
      .where(eq(riderStats.id, id));

    revalidatePath("/admin/results");
    revalidatePath("/api/drivers");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating rider stat:", error);
    return { success: false, error: error?.message || "Failed to update standings statistics." };
  }
}

export async function deleteRiderStat(id: string) {
  try {
    await db.delete(riderStats).where(eq(riderStats.id, id));
    revalidatePath("/admin/results");
    revalidatePath("/api/drivers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting rider stat:", error);
    return { success: false, error: "Failed to delete standings statistics." };
  }
}

export async function getAchievementById(id: string) {
  try {
    const record = await db.select().from(achievements).where(eq(achievements.id, id)).limit(1);
    return record[0] || null;
  } catch (error) {
    console.error("Error fetching achievement by ID:", error);
    throw new Error("Failed to fetch achievement");
  }
}

export async function getRiderStatById(id: string) {
  try {
    const record = await db.select().from(riderStats).where(eq(riderStats.id, id)).limit(1);
    return record[0] || null;
  } catch (error) {
    console.error("Error fetching standings stat by ID:", error);
    throw new Error("Failed to fetch standings stat");
  }
}
