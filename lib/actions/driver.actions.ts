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

export async function createDriver(data: {
  fullName: string;
  dob?: string;
  otherName?: string;
  slug: string;
  racingCategory?: string;
  yearsActive?: number;
  totalRaces?: number;
  totalWins?: number;
  totalPodiums?: number;
  bestCareerFinish?: string;
  championshipsWon?: string;
  currentTeam?: string;
  previousTeams?: string;
  sponsorDetails?: string;
  vehicleModel?: string;
  engineCapacity?: string;
  vehicleClass?: string;
  chassisNumber?: string;
  liveryScheme?: string;
  achievements?: any[];
  riderStats?: any[];
}) {
  try {
    const id = crypto.randomUUID();
    const { achievements: achievementsData, riderStats: statsData, ...driverInfo } = data;

    await db.transaction(async (tx) => {
      await tx.insert(drivers).values({
        id,
        ...driverInfo,
      });

      if (achievementsData && achievementsData.length > 0) {
        await tx.insert(achievements).values(
          achievementsData.map((a) => ({ ...a, driverId: id, id: crypto.randomUUID() }))
        );
      }

      if (statsData && statsData.length > 0) {
        await tx.insert(riderStats).values(
          statsData.map((s) => ({ ...s, driverId: id, id: crypto.randomUUID() }))
        );
      }
    });

    revalidatePath("/admin/drivers");
    return { success: true, id };
  } catch (error: any) {
    console.error("Error creating driver:", error);
    return { success: false, error: error?.message || "Failed to create driver." };
  }
}

export async function updateDriver(id: string, data: {
  fullName: string;
  dob?: string;
  otherName?: string;
  slug: string;
  racingCategory?: string;
  yearsActive?: number;
  totalRaces?: number;
  totalWins?: number;
  totalPodiums?: number;
  bestCareerFinish?: string;
  championshipsWon?: string;
  currentTeam?: string;
  previousTeams?: string;
  sponsorDetails?: string;
  vehicleModel?: string;
  engineCapacity?: string;
  vehicleClass?: string;
  chassisNumber?: string;
  liveryScheme?: string;
  achievements?: any[];
  riderStats?: any[];
}) {
  try {
    const { achievements: achievementsData, riderStats: statsData, ...driverInfo } = data;

    await db.transaction(async (tx) => {
      // Update basic info
      await tx.update(drivers).set({
        ...driverInfo,
        updatedAt: new Date(),
      }).where(eq(drivers.id, id));

      // Sync achievements (Delete and re-insert)
      await tx.delete(achievements).where(eq(achievements.driverId, id));
      if (achievementsData && achievementsData.length > 0) {
        await tx.insert(achievements).values(
          achievementsData.map((a) => ({ ...a, driverId: id, id: crypto.randomUUID() }))
        );
      }

      // Sync stats (Delete and re-insert)
      await tx.delete(riderStats).where(eq(riderStats.driverId, id));
      if (statsData && statsData.length > 0) {
        await tx.insert(riderStats).values(
          statsData.map((s) => ({ ...s, driverId: id, id: crypto.randomUUID() }))
        );
      }
    });

    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating driver:", error);
    return { success: false, error: error?.message || "Failed to update driver." };
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
