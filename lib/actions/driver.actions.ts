"use server";

import { revalidatePath } from "next/cache";
import { db, drivers, achievements, riderStats } from "@/lib/db";
import { eq, desc, or, like, sql } from "drizzle-orm";
import { getCurrentUser, getCurrentAdmin } from "./auth.actions";

export async function getDrivers(q?: string, page: number = 1, limit: number = 10) {
  try {
    let query = db.select().from(drivers);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(drivers);
    
    if (q) {
      const searchPattern = `%${q}%`;
      const searchCondition = or(
        like(drivers.fullName, searchPattern),
        like(drivers.slug, searchPattern),
        like(drivers.currentTeam, searchPattern),
        like(drivers.racingCategory, searchPattern)
      );
      query = query.where(searchCondition) as any;
      countQuery = countQuery.where(searchCondition) as any;
    }
    
    const offset = (page - 1) * limit;

    const [{ count }] = await countQuery;
    const allDrivers = await query.orderBy(desc(drivers.createdAt)).limit(limit).offset(offset);
    
    return { drivers: allDrivers, total: Number(count) };
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

async function generateUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
  const base = baseSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || "athlete";
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await db.select().from(drivers).where(eq(drivers.slug, slug)).limit(1);
    if (existing.length === 0 || (currentId && existing[0].id === currentId)) {
      return slug;
    }
    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function createDriver(data: any) {
  try {
    const user = await getCurrentUser();
    const id = crypto.randomUUID();
    const { achievements: achievementsData, riderStats: statsData, ...driverInfo } = data;

    const slug = await generateUniqueSlug(driverInfo.slug || driverInfo.fullName || "athlete");
    driverInfo.slug = slug;

    await db.transaction(async (tx) => {
      // 1. Insert main driver profile
      await tx.insert(drivers).values({
        id,
        userId: user ? user.id : null,
        status: "pending",
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
    if (error?.message?.includes("Duplicate entry") || error?.code === "ER_DUP_ENTRY") {
      if (error.message.includes("slug")) {
        return { success: false, error: "An athlete profile with this slug already exists. Please choose a different full name or customize the slug." };
      }
      return { success: false, error: "A duplicate record was found. Please make sure all unique fields (like slug) are distinct." };
    }
    return { success: false, error: error?.message || "Failed to create driver profile." };
  }
}

export async function updateDriver(id: string, data: any) {
  try {
    console.log(`[UPDATE_DRIVER] Starting update for ID: ${id}`);
    const admin = await getCurrentAdmin();
    const { achievements: achievementsData, riderStats: statsData, ...driverInfo } = data;

    const slug = await generateUniqueSlug(driverInfo.slug || driverInfo.fullName || "athlete", id);
    driverInfo.slug = slug;

    // Check if driver has "approved" status and this is updated by a non-admin (a driver user)
    if (!admin) {
      const existingDriver = await db.query.drivers.findFirst({
        where: eq(drivers.id, id),
      });

      if (existingDriver && existingDriver.status === "approved") {
        // Save to pendingChanges as JSON
        const serialized = JSON.stringify({
          ...driverInfo,
          achievements: achievementsData || [],
          riderStats: statsData || [],
        });

        await db.update(drivers).set({
          pendingChanges: serialized,
          updatedAt: new Date(),
        }).where(eq(drivers.id, id));

        console.log(`[UPDATE_DRIVER] Saved changes to pending_changes for driver ID: ${id}`);
        revalidatePath(`/admin/drivers/${id}`);
        revalidatePath("/submit-profile");
        return { success: true, pending: true };
      }
    }

    // Direct update (admin, or non-approved driver)
    await db.transaction(async (tx) => {
      // 1. Update main driver profile
      const updateData: any = {
        ...driverInfo,
        updatedAt: new Date(),
      };
      
      // If a driver updates their own pending/rejected profile, make it pending again
      if (!admin) {
        updateData.status = "pending";
      }

      await tx.update(drivers).set(updateData).where(eq(drivers.id, id));

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
    revalidatePath("/submit-profile");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_DRIVER_ERROR]", error);
    if (error?.message?.includes("Duplicate entry") || error?.code === "ER_DUP_ENTRY") {
      if (error.message.includes("slug")) {
        return { success: false, error: "An athlete profile with this slug already exists. Please choose a different full name or customize the slug." };
      }
      return { success: false, error: "A duplicate record was found. Please make sure all unique fields (like slug) are distinct." };
    }
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

export async function approvePendingChanges(id: string) {
  try {
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.id, id),
    });

    if (!driver || !driver.pendingChanges) {
      return { success: false, error: "No pending changes found to approve." };
    }

    const data = JSON.parse(driver.pendingChanges);
    const { achievements: achievementsData, riderStats: statsData, ...driverInfo } = data;

    await db.transaction(async (tx) => {
      // 1. Update main driver profile, clear pendingChanges
      await tx.update(drivers).set({
        ...driverInfo,
        pendingChanges: null,
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

    console.log(`[APPROVE_PENDING_CHANGES] Approved changes for driver ID: ${id}`);
    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${id}`);
    revalidatePath("/submit-profile");
    return { success: true };
  } catch (error: any) {
    console.error("[APPROVE_PENDING_CHANGES_ERROR]", error);
    return { success: false, error: error?.message || "Failed to approve pending changes." };
  }
}

export async function rejectPendingChanges(id: string) {
  try {
    await db.update(drivers).set({
      pendingChanges: null,
      updatedAt: new Date(),
    }).where(eq(drivers.id, id));

    console.log(`[REJECT_PENDING_CHANGES] Rejected changes for driver ID: ${id}`);
    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${id}`);
    revalidatePath("/submit-profile");
    return { success: true };
  } catch (error: any) {
    console.error("[REJECT_PENDING_CHANGES_ERROR]", error);
    return { success: false, error: error?.message || "Failed to reject pending changes." };
  }
}
