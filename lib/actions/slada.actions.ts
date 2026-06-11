"use server";

import { revalidatePath } from "next/cache";
import { db, sladaPage, sladaCommittee } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import * as crypto from "crypto";

const defaults: Record<string, {
  logoUrl: string;
  aboutTitle: string;
  aboutImageUrl: string;
  aboutDescription: string;
  committeeTitle: string;
  committeeDescription: string;
}> = {
  slada: {
    logoUrl: "/slada-logo.png",
    aboutTitle: "About SLADA",
    aboutImageUrl: "/slada-bio.png",
    aboutDescription: "The Sri Lanka Autosports Drivers Association (SLADA) is one of Sri Lanka’s leading motorsport organizations, dedicated to the development, promotion, and organization of competitive motor racing across the country. Established in 2013, SLADA was formed through the collective efforts of Sri Lanka's motorsport community following a period of inactivity in national racing events, with the objective of revitalizing and modernizing the sport.\n\nOperating under the recognition of the Ministry of Sports, SLADA works closely with the Sri Lanka Army and Sri Lanka Air Force to deliver professionally organized motorsport events at some of the country's most iconic racing venues, including Katukurunda and Saliyapura. The association plays a key role in maintaining competitive standards, improving safety regulations, and creating opportunities for both experienced competitors and emerging talent.\n\nSLADA's racing calendar features a variety of tarmac and gravel racing disciplines for both automobiles and motorcycles, bringing together drivers, riders, teams, sponsors, officials, and fans from across Sri Lanka. Through its commitment to innovation, professionalism, and safety, SLADA continues to contribute significantly to the growth of Sri Lankan motorsport while helping develop the next generation of racing talent.",
    committeeTitle: "SLADA Committee (2026/2027)",
    committeeDescription: "Following the 14th Annual General Meeting, the following office bearers were appointed to lead SLADA for the 2026/2027 term."
  },
  cmsc: {
    logoUrl: "/logo.svg",
    aboutTitle: "About CMSC",
    aboutImageUrl: "/slada-bio.png",
    aboutDescription: "The Ceylon Motor Sports Club (CMSC) is one of the oldest motor sports clubs in Sri Lanka, dedicated to fostering motorsport excellence, organising track races, hill climbs, and rallies across the nation. Formed during the early years of Sri Lankan motorsports, CMSC has been a pioneer in creating safe, structured, and highly competitive racing events, nurturing generations of national champions.\n\nWorking alongside national sports bodies and global federations, CMSC maintains international safety regulations and driving standards, giving local competitors a path to regional motorsport representation. Through rallies, drag races, and autocrosses, the Ceylon Motor Sports Club continues to be a cornerstone of racing culture in Sri Lanka.",
    committeeTitle: "CMSC Committee (2026/2027)",
    committeeDescription: "Following the recent general assembly, the following office bearers were appointed to lead CMSC for the 2026/2027 term."
  },
  mrs: {
    logoUrl: "/logo.svg",
    aboutTitle: "About MRS",
    aboutImageUrl: "/slada-bio.png",
    aboutDescription: "The Motor Racing Association of Sri Lanka (MRS) is dedicated to organizing professional racing events across tarmac and gravel tracks. MRS focuses on expanding the reach of motorsports by hosting accessible track days, karting events, and entry-level racing series for newcomers.\n\nCollaborating with local teams and sponsors, MRS maintains competitive standards, improves track safety rules, and helps develop the next generation of racers in Sri Lanka.",
    committeeTitle: "MRS Committee (2026/2027)",
    committeeDescription: "Following the recent general assembly, the following office bearers were appointed to lead MRS for the 2026/2027 term."
  },
  slamsc: {
    logoUrl: "/logo.svg",
    aboutTitle: "About SLAMSC",
    aboutImageUrl: "/slada-bio.png",
    aboutDescription: "The Sri Lanka Motor Cycle Sports Club (SLAMSC) focuses on the development, training, and promotion of competitive motorcycle racing in Sri Lanka. Dedicated to motorcycling disciplines, SLAMSC organizes both road racing and motocross championships at prominent venues, bringing together riders, teams, and fans.\n\nSLAMSC is committed to promoting rider safety, professional training, and rider development, ensuring Sri Lankan riders can excel on both domestic and international stages.",
    committeeTitle: "SLAMSC Committee (2026/2027)",
    committeeDescription: "Following the recent general assembly, the following office bearers were appointed to lead SLAMSC for the 2026/2027 term."
  }
};

export async function getSladaContent(category: string = "slada") {
  try {
    // 1. Fetch SLADA Page settings for the specified category
    let page = await db.query.sladaPage.findFirst({
      where: eq(sladaPage.id, category),
    });

    // Fallback if not seeded yet
    if (!page) {
      const defaultPage = defaults[category] || defaults.slada;
      await db.insert(sladaPage).values({
        id: category,
        logoUrl: defaultPage.logoUrl,
        aboutTitle: defaultPage.aboutTitle,
        aboutImageUrl: defaultPage.aboutImageUrl,
        aboutDescription: defaultPage.aboutDescription,
        committeeTitle: defaultPage.committeeTitle,
        committeeDescription: defaultPage.committeeDescription
      });
      page = await db.query.sladaPage.findFirst({
        where: eq(sladaPage.id, category),
      });
    }

    // 2. Fetch all Committee Members for this category ordered by display_order
    const committee = await db
      .select()
      .from(sladaCommittee)
      .where(eq(sladaCommittee.category, category))
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

export async function updateSladaPage(
  category: string,
  data: {
    logoUrl: string;
    aboutTitle: string;
    aboutImageUrl: string;
    aboutDescription: string;
    committeeTitle: string;
    committeeDescription: string;
  }
) {
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
      .where(eq(sladaPage.id, category));

    revalidatePath("/racing-in-sri-lanka/slada");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_SLADA_PAGE_ERROR]", error);
    return { success: false, error: error?.message || "Failed to update SLADA page settings." };
  }
}

export async function addCommitteeMember(
  category: string,
  data: {
    name: string;
    role: string;
    bgPosition: string;
    image?: string;
    displayOrder: number;
  }
) {
  try {
    const id = crypto.randomUUID();
    await db.insert(sladaCommittee).values({
      id,
      name: data.name,
      role: data.role,
      bgPosition: data.bgPosition || "0% 0%",
      image: data.image || null,
      displayOrder: data.displayOrder || 0,
      category,
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
