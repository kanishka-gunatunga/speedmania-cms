"use server";

import { revalidatePath } from "next/cache";
import { db, drivers, achievements, riderStats } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function getDrivers() {
  try {
    const allDrivers = await db.select().from(drivers).orderBy(desc(drivers.createdAt));
    return allDrivers;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw new Error("Failed to fetch drivers");
  }
}

export async function getDriverById(id: string) {
  try {
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.id, id),
      with: {
        achievements: true,
        riderStats: true,
      },
    });
    return driver || null;
  } catch (error) {
    console.error("Error fetching driver by ID:", error);
    throw new Error("Failed to fetch driver");
  }
}

export async function createDriver(data: any) {
  try {
    const id = crypto.randomUUID();
    const { achievements: achievementsData, riderStats: statsData, ...driverInfo } = data;

    await db.transaction(async (tx) => {
      // 1. Insert main driver profile
      await tx.insert(drivers).values({
        id,
        ...driverInfo,
      });

      // 2. Insert Achievements
      if (achievementsData && achievementsData.length > 0) {
        const achievementsToInsert = achievementsData.map((a: any) => ({
          id: crypto.randomUUID(),
          driverId: id,
          raceName: a.raceName,
          year: a.year ? parseInt(a.year.toString()) : null,
          date: a.date || null,
          team: a.team || null,
          position: a.position || null,
          points: a.points ? parseInt(a.points.toString()) : 0,
          category: a.category || "Formula 1",
        }));
        await tx.insert(achievements).values(achievementsToInsert);
      }

      // 3. Insert Rider Stats
      if (statsData && statsData.length > 0) {
        const statsToInsert = statsData.map((s: any) => ({
          id: crypto.randomUUID(),
          driverId: id,
          season: s.season ? parseInt(s.season.toString()) : null,
          category: s.category || "Formula 1",
          bike: s.bike || null,
          starts: parseInt(s.starts?.toString() || "0"),
          poles: parseInt(s.poles?.toString() || "0"),
          firstPos: parseInt(s.firstPos?.toString() || "0"),
          secondPos: parseInt(s.secondPos?.toString() || "0"),
          thirdPos: parseInt(s.thirdPos?.toString() || "0"),
          podiums: parseInt(s.podiums?.toString() || "0"),
          points: parseInt(s.points?.toString() || "0"),
          position: s.position || null,
          fastestLaps: parseInt(s.fastestLaps?.toString() || "0"),
          dnfs: parseInt(s.dnfs?.toString() || "0"),
          sprintRaces: parseInt(s.sprintRaces?.toString() || "0"),
          sprintPoints: parseInt(s.sprintPoints?.toString() || "0"),
          sprintWins: parseInt(s.sprintWins?.toString() || "0"),
          sprintPodiums: parseInt(s.sprintPodiums?.toString() || "0"),
          sprintPoles: parseInt(s.sprintPoles?.toString() || "0"),
        }));
        await tx.insert(riderStats).values(statsToInsert);
      }
    });

    revalidatePath("/admin/drivers");
    return { success: true, id };
  } catch (error: any) {
    console.error("[CREATE_DRIVER_ERROR]", error);
    return { success: false, error: error?.message || "Failed to create driver profile." };
  }
}

export async function updateDriver(id: string, data: any) {
  try {
    console.log(`[UPDATE_DRIVER] Starting update for ID: ${id}`);
    const { achievements: achievementsData, riderStats: statsData, ...driverInfo } = data;

    await db.transaction(async (tx) => {
      // 1. Update main driver profile
      await tx.update(drivers).set({
        ...driverInfo,
        updatedAt: new Date(),
      }).where(eq(drivers.id, id));

      // 2. Refresh Achievements
      await tx.delete(achievements).where(eq(achievements.driverId, id));
      if (achievementsData && achievementsData.length > 0) {
        const achievementsToInsert = achievementsData.map((a: any) => ({
          id: crypto.randomUUID(),
          driverId: id,
          raceName: a.raceName,
          year: a.year ? (Number(a.year) || null) : null,
          date: a.date || null,
          team: a.team || null,
          position: a.position || null,
          points: a.points ? (Number(a.points) || 0) : 0,
          category: a.category || "Formula 1",
        }));
        await tx.insert(achievements).values(achievementsToInsert);
      }

      // 3. Refresh Rider Stats
      await tx.delete(riderStats).where(eq(riderStats.driverId, id));
      if (statsData && statsData.length > 0) {
        const statsToInsert = statsData.map((s: any) => ({
          id: crypto.randomUUID(),
          driverId: id,
          season: s.season ? (Number(s.season) || null) : null,
          category: s.category || "Formula 1",
          bike: s.bike || null,
          starts: Number(s.starts) || 0,
          poles: Number(s.poles) || 0,
          firstPos: Number(s.firstPos) || 0,
          secondPos: Number(s.secondPos) || 0,
          thirdPos: Number(s.thirdPos) || 0,
          podiums: Number(s.podiums) || 0,
          points: Number(s.points) || 0,
          position: s.position || null,
          fastestLaps: Number(s.fastestLaps) || 0,
          dnfs: Number(s.dnfs) || 0,
          sprintRaces: Number(s.sprintRaces) || 0,
          sprintPoints: Number(s.sprintPoints) || 0,
          sprintWins: Number(s.sprintWins) || 0,
          sprintPodiums: Number(s.sprintPodiums) || 0,
          sprintPoles: Number(s.sprintPoles) || 0,
        }));
        await tx.insert(riderStats).values(statsToInsert);
      }
    });

    console.log(`[UPDATE_DRIVER] Successfully updated driver ID: ${id}`);
    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_DRIVER_ERROR]", error);
    return { success: false, error: error?.message || "Failed to update driver profile." };
  }
}

export async function deleteDriver(id: string) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(achievements).where(eq(achievements.driverId, id));
      await tx.delete(riderStats).where(eq(riderStats.driverId, id));
      await tx.delete(drivers).where(eq(drivers.id, id));
    });
    revalidatePath("/admin/drivers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting driver:", error);
    return { success: false, error: "Failed to delete driver." };
  }
}

export async function approveDriver(id: string) {
  try {
    await db.update(drivers).set({
      status: "approved",
      updatedAt: new Date(),
    }).where(eq(drivers.id, id));
    revalidatePath("/admin/drivers");
    return { success: true };
  } catch (error: any) {
    console.error("[APPROVE_DRIVER_ERROR]", error);
    return { success: false, error: error?.message || "Failed to approve driver." };
  }
}

export async function rejectDriver(id: string) {
  try {
    await db.update(drivers).set({
      status: "rejected",
      updatedAt: new Date(),
    }).where(eq(drivers.id, id));
    revalidatePath("/admin/drivers");
    return { success: true };
  } catch (error: any) {
    console.error("[REJECT_DRIVER_ERROR]", error);
    return { success: false, error: error?.message || "Failed to reject driver." };
  }
}
