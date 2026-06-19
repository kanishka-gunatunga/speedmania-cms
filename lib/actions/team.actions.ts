"use server";

import { revalidatePath } from "next/cache";
import { db, teams, drivers, teamCategories, categories } from "@/lib/db";
import { eq, desc, or, inArray, like, sql } from "drizzle-orm";

export async function getTeams(q?: string, page: number = 1, limit: number = 10) {
  try {
    const whereCondition = q ? or(
      like(teams.name, `%${q}%`),
      like(teams.subtitle, `%${q}%`),
      like(teams.slug, `%${q}%`),
      like(teams.category, `%${q}%`)
    ) : undefined;

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(teams)
      .where(whereCondition);

    const offset = (page - 1) * limit;

    const allTeams = await db.select().from(teams)
      .where(whereCondition)
      .orderBy(desc(teams.createdAt))
      .limit(limit)
      .offset(offset);

    if (allTeams.length === 0) {
      return { teams: [], total: Number(countResult[0].count) };
    }

    const teamIds = allTeams.map((t: any) => t.id);

    const mappings = await db.select({
      teamId: teamCategories.teamId,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
        type: categories.type
      }
    })
    .from(teamCategories)
    .innerJoin(categories, eq(teamCategories.categoryId, categories.id))
    .where(inArray(teamCategories.teamId, teamIds));

    const teamCatsMap = new Map();
    mappings.forEach((m: any) => {
      if (!teamCatsMap.has(m.teamId)) teamCatsMap.set(m.teamId, []);
      teamCatsMap.get(m.teamId).push({ category: m.category });
    });

    const teamsWithCats = allTeams.map((t: any) => ({
      ...t,
      teamCategories: teamCatsMap.get(t.id) || []
    }));

    return { teams: teamsWithCats, total: Number(countResult[0].count) };
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw new Error("Failed to fetch teams");
  }
}

export async function getTeamById(idOrSlug: string) {
  try {
    const team = await db.select().from(teams)
      .where(or(eq(teams.id, idOrSlug), eq(teams.slug, idOrSlug)))
      .limit(1);

    if (!team[0]) return null;

    const teamDrivers = await db.select().from(drivers).where(eq(drivers.teamId, team[0].id));

    const mappings = await db.select({
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
        type: categories.type
      }
    })
    .from(teamCategories)
    .innerJoin(categories, eq(teamCategories.categoryId, categories.id))
    .where(eq(teamCategories.teamId, team[0].id));

    return {
      ...team[0],
      drivers: teamDrivers,
      teamCategories: mappings
    };
  } catch (error) {
    console.error("Error fetching team by ID:", error);
    throw new Error("Failed to fetch team");
  }
}

async function generateUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
  const base = baseSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || "team";
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await db.select().from(teams).where(eq(teams.slug, slug)).limit(1);
    if (existing.length === 0 || (currentId && existing[0].id === currentId)) {
      return slug;
    }
    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function createTeam(data: any) {
  try {
    const id = crypto.randomUUID();
    const { driverIds, roster, categoryIds, ...teamInfo } = data;

    const slug = await generateUniqueSlug(teamInfo.slug || teamInfo.name || "team");
    teamInfo.slug = slug;

    await db.transaction(async (tx) => {
      // 1. Insert main team profile
      await tx.insert(teams).values({
        id,
        ...teamInfo,
        roster: roster ? JSON.stringify(roster) : "[]",
      });

      // 2. Associate categories if any
      if (categoryIds && categoryIds.length > 0) {
        const catInserts = categoryIds.map((catId: string) => ({
          teamId: id,
          categoryId: catId,
        }));
        await tx.insert(teamCategories).values(catInserts);
      }

      // 3. Associate Drivers/Riders if any
      if (driverIds && driverIds.length > 0) {
        await tx
          .update(drivers)
          .set({ teamId: id, currentTeam: teamInfo.name })
          .where(inArray(drivers.id, driverIds));
      }
    });

    revalidatePath("/admin/teams");
    revalidatePath("/teams");
    return { success: true, id };
  } catch (error: any) {
    console.error("[CREATE_TEAM_ERROR]", error);
    if (error?.message?.includes("Duplicate entry") || error?.code === "ER_DUP_ENTRY") {
      if (error.message.includes("slug")) {
        return { success: false, error: "A team with this slug already exists. Please choose a different team name or customize the slug." };
      }
      return { success: false, error: "A duplicate record was found. Please make sure all unique fields (like slug) are distinct." };
    }
    return { success: false, error: error?.message || "Failed to create team profile." };
  }
}

export async function updateTeam(id: string, data: any) {
  try {
    const { driverIds, roster, categoryIds, ...teamInfo } = data;

    const slug = await generateUniqueSlug(teamInfo.slug || teamInfo.name || "team", id);
    teamInfo.slug = slug;

    await db.transaction(async (tx) => {
      // 1. Update main team profile
      await tx
        .update(teams)
        .set({
          ...teamInfo,
          roster: roster ? JSON.stringify(roster) : "[]",
          updatedAt: new Date(),
        })
        .where(eq(teams.id, id));

      // 2. Update Categories
      await tx.delete(teamCategories).where(eq(teamCategories.teamId, id));
      if (categoryIds && categoryIds.length > 0) {
        const catInserts = categoryIds.map((catId: string) => ({
          teamId: id,
          categoryId: catId,
        }));
        await tx.insert(teamCategories).values(catInserts);
      }

      // 3. Unlink previously associated drivers
      await tx
        .update(drivers)
        .set({ teamId: null, currentTeam: null })
        .where(eq(drivers.teamId, id));

      // 4. Link newly selected drivers
      if (driverIds && driverIds.length > 0) {
        await tx
          .update(drivers)
          .set({ teamId: id, currentTeam: teamInfo.name })
          .where(inArray(drivers.id, driverIds));
      }
    });

    revalidatePath("/admin/teams");
    revalidatePath(`/admin/teams/${id}`);
    revalidatePath("/teams");
    revalidatePath(`/teams/${id}`);
    revalidatePath(`/teams/${teamInfo.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_TEAM_ERROR]", error);
    if (error?.message?.includes("Duplicate entry") || error?.code === "ER_DUP_ENTRY") {
      if (error.message.includes("slug")) {
        return { success: false, error: "A team with this slug already exists. Please choose a different team name or customize the slug." };
      }
      return { success: false, error: "A duplicate record was found. Please make sure all unique fields (like slug) are distinct." };
    }
    return { success: false, error: error?.message || "Failed to update team profile." };
  }
}

export async function deleteTeam(id: string) {
  try {
    await db.transaction(async (tx) => {
      // 1. Unlink drivers
      await tx
        .update(drivers)
        .set({ teamId: null, currentTeam: null })
        .where(eq(drivers.teamId, id));

      // 2. Delete team
      await tx.delete(teams).where(eq(teams.id, id));
    });

    revalidatePath("/admin/teams");
    revalidatePath("/teams");
    return { success: true };
  } catch (error) {
    console.error("Error deleting team:", error);
    return { success: false, error: "Failed to delete team." };
  }
}
