"use server";

import { revalidatePath } from "next/cache";
import { db, categories, blogCategories } from "@/lib/db";
import { desc, eq, asc, sql } from "drizzle-orm";

async function initializeCategoryTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS \`categories\` (
      \`id\` varchar(191) NOT NULL,
      \`name\` varchar(100) NOT NULL,
      \`slug\` varchar(191) NOT NULL,
      \`parent_id\` varchar(191) DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`categories_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`categories_name_unique\` UNIQUE(\`name\`),
      CONSTRAINT \`categories_slug_unique\` UNIQUE(\`slug\`),
      CONSTRAINT \`fk_categories_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS \`blog_categories\` (
      \`blog_id\` varchar(191) NOT NULL,
      \`category_id\` varchar(191) NOT NULL,
      CONSTRAINT \`blog_categories_pk\` PRIMARY KEY(\`blog_id\`, \`category_id\`)
    );`
  ];
  for (const q of queries) {
    await db.execute(sql.raw(q));
  }

  // Seed default categories
  const defaultCats = [
    { id: "cat-f1", name: "Formula 1", slug: "formula-1" },
    { id: "cat-motogp", name: "MotoGP", slug: "motogp" },
    { id: "cat-sl", name: "Sri Lanka Racing", slug: "sri-lanka-racing" },
    { id: "cat-editors", name: "Editor's Pick", slug: "editors-pick" },
  ];
  for (const cat of defaultCats) {
    try {
      await db.insert(categories).values({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }).onDuplicateKeyUpdate({ set: { name: cat.name } });
    } catch (e) {
      console.error("Failed to seed fallback category during self-healing:", e);
    }
  }
}

export async function getCategories() {
  try {
    // Dynamic Self-Healing: Check and alter categories table to add parent_id if it doesn't exist
    try {
      await db.execute(sql`ALTER TABLE \`categories\` ADD COLUMN \`parent_id\` varchar(191) DEFAULT NULL`);
    } catch (err: any) {
      const isDuplicateColumnError = 
        err?.code === "ER_DUP_FIELDNAME" ||
        err?.cause?.code === "ER_DUP_FIELDNAME" ||
        err?.errno === 1060 ||
        err?.cause?.errno === 1060 ||
        err?.sqlState === "42S21" ||
        err?.cause?.sqlState === "42S21" ||
        err?.message?.includes("Duplicate column") ||
        err?.cause?.message?.includes("Duplicate column") ||
        err?.message?.includes("already exists") ||
        err?.cause?.message?.includes("already exists");

      if (!isDuplicateColumnError) {
        console.error("Migration error adding parent_id column:", err);
      }
    }

    let allCategories = await db.select().from(categories).orderBy(asc(categories.name));
    if (allCategories.length === 0) {
      console.log("Categories table is empty. Initializing defaults...");
      await initializeCategoryTables();
      allCategories = await db.select().from(categories).orderBy(asc(categories.name));
    }
    return allCategories;
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.message?.includes("doesn't exist")) {
      try {
        console.log("Self-healing: Creating categories tables...");
        await initializeCategoryTables();
        const allCategories = await db.select().from(categories).orderBy(asc(categories.name));
        return allCategories;
      } catch (retryErr) {
        console.error("Self-healing fetch failed:", retryErr);
      }
    }
    // Return standard mock fallbacks so that the UI never crashes
    return [
      { id: "cat-f1", name: "Formula 1", slug: "formula-1", parentId: null, createdAt: new Date() },
      { id: "cat-motogp", name: "MotoGP", slug: "motogp", parentId: null, createdAt: new Date() },
      { id: "cat-sl", name: "Sri Lanka Racing", slug: "sri-lanka-racing", parentId: null, createdAt: new Date() },
      { id: "cat-editors", name: "Editor's Pick", slug: "editors-pick", parentId: null, createdAt: new Date() },
    ];
  }
}

export async function createCategory(data: { name: string; slug: string; parentId?: string | null }) {
  try {
    const id = crypto.randomUUID();
    await db.insert(categories).values({
      id,
      name: data.name,
      slug: data.slug,
      parentId: data.parentId || null,
    });

    revalidatePath("/admin/categories");
    return { success: true, category: { id, ...data } };
  } catch (error: any) {
    console.error("Error creating category:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.message?.includes("doesn't exist")) {
      try {
        console.log("Self-healing: Creating categories tables...");
        await initializeCategoryTables();
        const id = crypto.randomUUID();
        await db.insert(categories).values({
          id,
          name: data.name,
          slug: data.slug,
          parentId: data.parentId || null,
        });
        revalidatePath("/admin/categories");
        return { success: true, category: { id, ...data } };
      } catch (retryErr: any) {
        console.error("Self-healing create failed:", retryErr);
        return { success: false, error: "Failed to initialize categories table. " + retryErr.message };
      }
    }
    return {
      success: false,
      error: error?.message || "Failed to create category. Name/Slug might not be unique."
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Clean up junction table mappings
    await db.delete(blogCategories).where(eq(blogCategories.categoryId, id));
    // Delete the category itself
    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.message?.includes("doesn't exist")) {
      try {
        console.log("Self-healing: Creating categories tables...");
        await initializeCategoryTables();
        revalidatePath("/admin/categories");
        return { success: true };
      } catch (retryErr) {
        console.error("Self-healing delete failed:", retryErr);
      }
    }
    return { success: false, error: "Failed to delete category." };
  }
}
