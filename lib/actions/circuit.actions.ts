"use server";

import { revalidatePath } from "next/cache";
import { db, circuits, circuitFaqs, circuitCategories, categories } from "@/lib/db";
import { eq, desc, sql, or, like } from "drizzle-orm";

export async function getCircuits(q?: string, page: number = 1, limit: number = 10) {
  try {
    // Dynamic Self-Healing: Check and alter circuits table to add racing_category if it doesn't exist
    try {
      await db.execute(sql`ALTER TABLE \`circuits\` ADD COLUMN IF NOT EXISTS \`racing_category\` varchar(100) DEFAULT NULL`);
      await db.execute(sql`UPDATE \`circuits\` SET \`racing_category\` = 'Formula 1' WHERE \`racing_category\` IS NULL`);
    } catch (migErr) {
      console.warn("Self-healing migration warning for circuits table:", migErr);
    }

    // Dynamic Self-Healing: Ensure circuit_categories junction table exists
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS \`circuit_categories\` (
          \`circuit_id\` varchar(191) NOT NULL,
          \`category_id\` varchar(191) NOT NULL,
          PRIMARY KEY (\`circuit_id\`, \`category_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (tableErr) {
      console.warn("Self-healing table creation warning for circuit_categories:", tableErr);
    }

    let query = db.select().from(circuits);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(circuits);

    if (q) {
      const searchPattern = `%${q}%`;
      const searchCondition = or(
        like(circuits.name, searchPattern),
        like(circuits.slug, searchPattern),
        like(circuits.racingCategory, searchPattern)
      );
      query = query.where(searchCondition) as any;
      countQuery = countQuery.where(searchCondition) as any;
    }

    const offset = (page - 1) * limit;

    const [{ count }] = await countQuery;
    const allCircuits = await query.orderBy(desc(circuits.createdAt)).limit(limit).offset(offset);

    const mappings = await db
      .select({
        circuitId: circuitCategories.circuitId,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          parentId: categories.parentId,
          type: categories.type,
        },
      })
      .from(circuitCategories)
      .innerJoin(categories, eq(categories.id, circuitCategories.categoryId));

    const circuitsWithCats = allCircuits.map((circuit) => {
      const assoc = mappings
        .filter((m) => m.circuitId === circuit.id)
        .map((m) => ({
          circuitId: circuit.id,
          categoryId: m.category.id,
          category: m.category,
        }));
      return {
        ...circuit,
        circuitCategories: assoc,
      };
    });
    return { circuits: circuitsWithCats, total: Number(count) };
  } catch (error) {
    console.error("Error fetching circuits:", error);
    throw new Error("Failed to fetch circuits");
  }
}

export async function getCircuitById(id: string) {
  try {
    // Dynamic Self-Healing: Ensure table exists when retrieving details
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS \`circuit_categories\` (
          \`circuit_id\` varchar(191) NOT NULL,
          \`category_id\` varchar(191) NOT NULL,
          PRIMARY KEY (\`circuit_id\`, \`category_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (tableErr) {
      console.warn("Self-healing table creation warning for circuit_categories:", tableErr);
    }

    const circuit = await db.query.circuits.findFirst({
      where: eq(circuits.id, id),
      with: {
        faqs: true,
      },
    });

    if (!circuit) return null;

    const assocCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
        type: categories.type,
      })
      .from(circuitCategories)
      .innerJoin(categories, eq(categories.id, circuitCategories.categoryId))
      .where(eq(circuitCategories.circuitId, id));

    return {
      ...circuit,
      circuitCategories: assocCategories.map((cat) => ({
        circuitId: id,
        categoryId: cat.id,
        category: cat,
      })),
    };
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
  categoryIds?: string[];
  faqs?: { question: string; answer: string }[];
}) {
  try {
    const id = crypto.randomUUID();
    const { faqs: faqsData, categoryIds, ...circuitInfo } = data;

    const slug = await generateUniqueSlug(circuitInfo.slug || circuitInfo.name || "circuit");
    circuitInfo.slug = slug;

    // Determine fallback racingCategory text for retro-compatibility (use name of first selected category)
    if (categoryIds && categoryIds.length > 0 && !circuitInfo.racingCategory) {
      try {
        const firstCategory = await db.query.categories.findFirst({
          where: eq(sql`id`, categoryIds[0]),
        });
        if (firstCategory) {
          circuitInfo.racingCategory = firstCategory.name;
        }
      } catch (err) {
        console.warn("Failed to determine fallback category name:", err);
      }
    }

    await db.transaction(async (tx) => {
      await tx.insert(circuits).values({
        id,
        ...circuitInfo,
      });

      if (categoryIds && categoryIds.length > 0) {
        await tx.insert(circuitCategories).values(
          categoryIds.map((catId) => ({
            circuitId: id,
            categoryId: catId,
          }))
        );
      }

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
  categoryIds?: string[];
  faqs?: { question: string; answer: string }[];
}) {
  try {
    const { faqs: faqsData, categoryIds, ...circuitInfo } = data;

    const slug = await generateUniqueSlug(circuitInfo.slug || circuitInfo.name || "circuit", id);
    circuitInfo.slug = slug;

    // Determine fallback racingCategory text for retro-compatibility (use name of first selected category)
    if (categoryIds && categoryIds.length > 0 && !circuitInfo.racingCategory) {
      try {
        const firstCategory = await db.query.categories.findFirst({
          where: eq(sql`id`, categoryIds[0]),
        });
        if (firstCategory) {
          circuitInfo.racingCategory = firstCategory.name;
        }
      } catch (err) {
        console.warn("Failed to determine fallback category name:", err);
      }
    }

    await db.transaction(async (tx) => {
      await tx.update(circuits).set({
        ...circuitInfo,
        updatedAt: new Date(),
      }).where(eq(circuits.id, id));

      // Sync categories: Delete and insert
      await tx.delete(circuitCategories).where(eq(circuitCategories.circuitId, id));

      if (categoryIds && categoryIds.length > 0) {
        await tx.insert(circuitCategories).values(
          categoryIds.map((catId) => ({
            circuitId: id,
            categoryId: catId,
          }))
        );
      }

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
      await tx.delete(circuitCategories).where(eq(circuitCategories.circuitId, id));
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
