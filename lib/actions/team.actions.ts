"use server";

import { revalidatePath } from "next/cache";
import { db, teams, drivers } from "@/lib/db";
import { eq, desc, or, inArray } from "drizzle-orm";

export async function getTeams() {
  try {
    const allTeams = await db.select().from(teams).orderBy(desc(teams.createdAt));
    return allTeams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw new Error("Failed to fetch teams");
  }
}

export async function getTeamById(idOrSlug: string) {
  try {
    const team = await db.query.teams.findFirst({
      where: or(eq(teams.id, idOrSlug), eq(teams.slug, idOrSlug)),
      with: {
        drivers: true,
      },
    });
    return team || null;
  } catch (error) {
    console.error("Error fetching team by ID:", error);
    throw new Error("Failed to fetch team");
  }
}

export async function createTeam(data: any) {
  try {
    const id = crypto.randomUUID();
    const { driverIds, roster, ...teamInfo } = data;

    await db.transaction(async (tx) => {
      // 1. Insert main team profile
      await tx.insert(teams).values({
        id,
        ...teamInfo,
        roster: roster ? JSON.stringify(roster) : "[]",
      });

      // 2. Associate Drivers/Riders if any
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
    return { success: false, error: error?.message || "Failed to create team profile." };
  }
}

export async function updateTeam(id: string, data: any) {
  try {
    const { driverIds, roster, ...teamInfo } = data;

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

      // 2. Unlink previously associated drivers
      await tx
        .update(drivers)
        .set({ teamId: null, currentTeam: null })
        .where(eq(drivers.teamId, id));

      // 3. Link newly selected drivers
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
