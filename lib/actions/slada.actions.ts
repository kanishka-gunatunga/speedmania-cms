"use server";

import { revalidatePath } from "next/cache";
import { db, sladaPage, sladaCommittee } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import * as crypto from "crypto";

export async function getSladaContent() {
  try {
    // 1. Fetch SLADA Page settings
    let page = await db.query.sladaPage.findFirst({
      where: eq(sladaPage.id, "1"),
    });

    // Fallback if not seeded yet
    if (!page) {
      const defaultPage = {
        id: "1",
        logoUrl: "/slada-logo.png",
        aboutTitle: "About SLADA",
        aboutImageUrl: "/slada-bio.png",
        aboutDescription: "The Sri Lanka Autosports Drivers Association (SLADA) is one of Sri Lanka’s leading motorsport organizations...",
        committeeTitle: "SLADA Committee (2026/2027)",
        committeeDescription: "Following the 14th Annual General Meeting, the following office bearers were appointed to lead SLADA for the 2026/2027 term."
      };
      await db.insert(sladaPage).values(defaultPage);
      page = await db.query.sladaPage.findFirst({
        where: eq(sladaPage.id, "1"),
      });
    }

    // 2. Fetch all Committee Members ordered by display_order
    const committee = await db
      .select()
      .from(sladaCommittee)
      .orderBy(asc(sladaCommittee.displayOrder));

    return {
      success: true,
      page: page || null,
      committee: committee || [],
    };
  } catch (error: any) {
    console.error("[GET_SLADA_CONTENT_ERROR]", error);
    return {
      success: false,
      error: error?.message || "Failed to retrieve SLADA content",
      page: null,
      committee: [],
    };
  }
}

export async function updateSladaPage(data: {
  logoUrl: string;
  aboutTitle: string;
  aboutImageUrl: string;
  aboutDescription: string;
  committeeTitle: string;
  committeeDescription: string;
}) {
  try {
    await db
      .update(sladaPage)
      .set({
        logoUrl: data.logoUrl,
        aboutTitle: data.aboutTitle,
        aboutImageUrl: data.aboutImageUrl,
        aboutDescription: data.aboutDescription,
        committeeTitle: data.committeeTitle,
        committeeDescription: data.committeeDescription,
        updatedAt: new Date(),
      })
      .where(eq(sladaPage.id, "1"));

    revalidatePath("/racing-in-sri-lanka/slada");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_SLADA_PAGE_ERROR]", error);
    return { success: false, error: error?.message || "Failed to update SLADA page settings." };
  }
}

export async function addCommitteeMember(data: {
  name: string;
  role: string;
  bgPosition: string;
  image?: string;
  displayOrder: number;
}) {
  try {
    const id = crypto.randomUUID();
    await db.insert(sladaCommittee).values({
      id,
      name: data.name,
      role: data.role,
      bgPosition: data.bgPosition || "0% 0%",
      image: data.image || null,
      displayOrder: data.displayOrder || 0,
    });

    revalidatePath("/racing-in-sri-lanka/slada");
    return { success: true, id };
  } catch (error: any) {
    console.error("[ADD_COMMITTEE_MEMBER_ERROR]", error);
    return { success: false, error: error?.message || "Failed to add committee member." };
  }
}

export async function updateCommitteeMember(
  id: string,
  data: {
    name: string;
    role: string;
    bgPosition: string;
    image?: string;
    displayOrder: number;
  }
) {
  try {
    await db
      .update(sladaCommittee)
      .set({
        name: data.name,
        role: data.role,
        bgPosition: data.bgPosition || "0% 0%",
        image: data.image || null,
        displayOrder: data.displayOrder || 0,
        updatedAt: new Date(),
      })
      .where(eq(sladaCommittee.id, id));

    revalidatePath("/racing-in-sri-lanka/slada");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_COMMITTEE_MEMBER_ERROR]", error);
    return { success: false, error: error?.message || "Failed to update committee member." };
  }
}

export async function deleteCommitteeMember(id: string) {
  try {
    await db.delete(sladaCommittee).where(eq(sladaCommittee.id, id));

    revalidatePath("/racing-in-sri-lanka/slada");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_COMMITTEE_MEMBER_ERROR]", error);
    return { success: false, error: error?.message || "Failed to delete committee member." };
  }
}
