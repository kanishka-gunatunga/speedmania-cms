"use server";

import { db } from "../db";
import { advertisements } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdvertisements() {
  try {
    const data = await db
      .select()
      .from(advertisements)
      .orderBy(desc(advertisements.createdAt));
    return { success: true, data };
  } catch (error: any) {
    console.error("Error getting advertisements:", error);
    return { success: false, error: error.message };
  }
}

export async function getActiveAdvertisement() {
  try {
    const data = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.isActive, true))
      .limit(1);
    
    return { success: true, data: data[0] || null };
  } catch (error: any) {
    console.error("Error getting active advertisement:", error);
    return { success: false, error: error.message };
  }
}

export async function createAdvertisement(data: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
}) {
  try {
    // If setting active, deactivate others first
    if (data.isActive) {
      await db.update(advertisements).set({ isActive: false });
    }

    await db.insert(advertisements).values({
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl || null,
      isActive: data.isActive || false,
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating advertisement:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAdvertisement(
  id: string,
  data: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    isActive?: boolean;
  }
) {
  try {
    if (data.isActive) {
      await db.update(advertisements).set({ isActive: false });
    }

    await db.update(advertisements).set(data).where(eq(advertisements.id, id));
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating advertisement:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdvertisement(id: string) {
  try {
    await db.delete(advertisements).where(eq(advertisements.id, id));
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting advertisement:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleAdvertisementStatus(id: string, isActive: boolean) {
  try {
    if (isActive) {
      // Deactivate all others first
      await db.update(advertisements).set({ isActive: false });
    }
    
    await db.update(advertisements).set({ isActive }).where(eq(advertisements.id, id));
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling advertisement status:", error);
    return { success: false, error: error.message };
  }
}
