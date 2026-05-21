"use server";

import { revalidatePath } from "next/cache";
import { db, circuits, circuitFaqs } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function getCircuits() {
  try {
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
  faqs?: { question: string; answer: string }[];
}) {
  try {
    const id = crypto.randomUUID();
    const { faqs: faqsData, ...circuitInfo } = data;

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
  faqs?: { question: string; answer: string }[];
}) {
  try {
    const { faqs: faqsData, ...circuitInfo } = data;

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
