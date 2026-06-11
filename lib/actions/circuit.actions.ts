"use server";

import { revalidatePath } from "next/cache";
import { db, circuits, circuitFaqs } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";

export async function getCircuits() {
  try {
    // Dynamic Self-Healing: Check and alter circuits table to add racing_category if it doesn't exist
    try {
      await db.execute(sql`ALTER TABLE \`circuits\` ADD COLUMN IF NOT EXISTS \`racing_category\` varchar(100) DEFAULT NULL`);
      await db.execute(sql`UPDATE \`circuits\` SET \`racing_category\` = 'Formula 1' WHERE \`racing_category\` IS NULL`);
    } catch (migErr) {
      console.warn("Self-healing migration warning for circuits table:", migErr);
    }

    const allCircuits = await db.select().from(circuits).orderBy(desc(circuits.createdAt));
    return allCircuits;
  } catch (error) {
    console.error("Error fetching circuits:", error);
    throw new Error("Failed to fetch circuits");
  }
}

export async function getCircuitById(id: string) {
  try {
    const circuit = await db.query.circuits.findFirst({
      where: eq(circuits.id, id),
      with: {
        faqs: true,
      },
    });
    return circuit || null;
  } catch (error) {
    console.error("Error fetching circuit by ID:", error);
    throw new Error("Failed to fetch circuit");
  }
}

async function generateUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
  const base = baseSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || "circuit";
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await db.select().from(circuits).where(eq(circuits.slug, slug)).limit(1);
    if (existing.length === 0 || (currentId && existing[0].id === currentId)) {
      return slug;
    }
    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function createCircuit(data: {
  name: string;
  slug: string;
  description?: string;
  trackImage?: string;
  aboutImage?: string;
  galleryImages?: string;
  circuitLength?: string;
  firstGrandPrix?: number;
  numberOfLaps?: number;
  fastestLapTime?: string;
  fastestLapDriver?: string;
  fastestLapYear?: number;
  raceDistance?: string;
  racingCategory?: string;
  faqs?: { question: string; answer: string }[];
}) {
  try {
    const id = crypto.randomUUID();
    const { faqs: faqsData, ...circuitInfo } = data;

    const slug = await generateUniqueSlug(circuitInfo.slug || circuitInfo.name || "circuit");
    circuitInfo.slug = slug;

    await db.transaction(async (tx) => {
      await tx.insert(circuits).values({
        id,
        ...circuitInfo,
      });

      if (faqsData && faqsData.length > 0) {
        await tx.insert(circuitFaqs).values(
          faqsData.map((faq) => ({
            id: crypto.randomUUID(),
            circuitId: id,
            ...faq,
          }))
        );
      }
    });

    revalidatePath("/admin/circuits");
    return { success: true, id };
  } catch (error: any) {
    console.error("Error creating circuit:", error);
    if (error?.message?.includes("Duplicate entry") || error?.code === "ER_DUP_ENTRY") {
      if (error.message.includes("slug")) {
        return { success: false, error: "A circuit with this slug already exists. Please choose a different circuit name or customize the slug." };
      }
      return { success: false, error: "A duplicate record was found. Please make sure all unique fields (like slug) are distinct." };
    }
    return { success: false, error: error?.message || "Failed to create circuit." };
  }
}

export async function updateCircuit(id: string, data: {
  name: string;
  slug: string;
  description?: string;
  trackImage?: string;
  aboutImage?: string;
  galleryImages?: string;
  circuitLength?: string;
  firstGrandPrix?: number;
  numberOfLaps?: number;
  fastestLapTime?: string;
  fastestLapDriver?: string;
  fastestLapYear?: number;
  raceDistance?: string;
  racingCategory?: string;
  faqs?: { question: string; answer: string }[];
}) {
  try {
    const { faqs: faqsData, ...circuitInfo } = data;

    const slug = await generateUniqueSlug(circuitInfo.slug || circuitInfo.name || "circuit", id);
    circuitInfo.slug = slug;

    await db.transaction(async (tx) => {
      await tx.update(circuits).set({
        ...circuitInfo,
        updatedAt: new Date(),
      }).where(eq(circuits.id, id));

      // Sync FAQs: Delete all existing and re-insert new ones
      await tx.delete(circuitFaqs).where(eq(circuitFaqs.circuitId, id));

      if (faqsData && faqsData.length > 0) {
        await tx.insert(circuitFaqs).values(
          faqsData.map((faq) => ({
            id: crypto.randomUUID(),
            circuitId: id,
            ...faq,
          }))
        );
      }
    });

    revalidatePath("/admin/circuits");
    revalidatePath(`/admin/circuits/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating circuit:", error);
    if (error?.message?.includes("Duplicate entry") || error?.code === "ER_DUP_ENTRY") {
      if (error.message.includes("slug")) {
        return { success: false, error: "A circuit with this slug already exists. Please choose a different circuit name or customize the slug." };
      }
      return { success: false, error: "A duplicate record was found. Please make sure all unique fields (like slug) are distinct." };
    }
    return { success: false, error: error?.message || "Failed to update circuit." };
  }
}

export async function deleteCircuit(id: string) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(circuitFaqs).where(eq(circuitFaqs.circuitId, id));
      await tx.delete(circuits).where(eq(circuits.id, id));
    });

    revalidatePath("/admin/circuits");
    return { success: true };
  } catch (error) {
    console.error("Error deleting circuit:", error);
    return { success: false, error: "Failed to delete circuit." };
  }
}
