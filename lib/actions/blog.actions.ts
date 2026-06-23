"use server";

import { revalidatePath } from "next/cache";
import { db, blogs, blogCategories, categories } from "@/lib/db";
import { desc, eq, and, or, like, sql } from "drizzle-orm";

export async function getBlogs(q?: string, page: number = 1, limit: number = 10) {
  try {
    let query = db.select().from(blogs);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(blogs);

    if (q) {
      const searchPattern = `%${q}%`;
      const searchCondition = or(
        like(blogs.title, searchPattern),
        like(blogs.slug, searchPattern),
        like(blogs.excerpt, searchPattern),
        like(blogs.author, searchPattern)
      );
      query = query.where(searchCondition) as any;
      countQuery = countQuery.where(searchCondition) as any;
    }

    const offset = (page - 1) * limit;
    
    const [{ count }] = await countQuery;
    const allBlogs = await query.orderBy(desc(blogs.createdAt)).limit(limit).offset(offset);

    return { blogs: allBlogs, total: Number(count) };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw new Error("Failed to fetch blogs");
  }
}

export async function getBlogById(id: string) {
  try {
    const blog = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
    if (!blog[0]) return null;

    let categoriesList: { id: string; name: string; slug: string }[] = [];
    try {
      categoriesList = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .innerJoin(blogCategories, eq(blogCategories.categoryId, categories.id))
        .where(eq(blogCategories.blogId, id));
    } catch (dbErr) {
      console.warn("Could not fetch blog categories from DB:", dbErr);
    }

    return {
      ...blog[0],
      categories: categoriesList,
    };
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    throw new Error("Failed to fetch blog");
  }
}

async function generateUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
  const base = baseSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || "post";
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
    if (existing.length === 0 || (currentId && existing[0].id === currentId)) {
      return slug;
    }
    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function createBlog(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  author?: string | null;
  published: boolean;
  categoryIds?: string[];
  seoMeta?: any;
}) {
  try {
    const id = crypto.randomUUID();
    const { categoryIds, seoMeta, ...blogData } = data;

    const slug = await generateUniqueSlug(blogData.slug || blogData.title || "post");
    blogData.slug = slug;

    await db.insert(blogs).values({
      id,
      ...blogData,
      featuredImage: blogData.featuredImage || null,
      excerpt: blogData.excerpt || null,
      author: blogData.author || null,
      seoMeta: seoMeta || null,
    });
    
    if (categoryIds && categoryIds.length > 0) {
      await db.insert(blogCategories).values(
        categoryIds.map((catId) => ({
          blogId: id,
          categoryId: catId,
        }))
      );
    }
    
    revalidatePath("/admin/blogs");
    return { success: true, blog: { id, ...data } };
  } catch (error: any) {
    console.error("Error creating blog:", error);
    if (error?.message?.includes("Duplicate entry") || error?.code === "ER_DUP_ENTRY") {
      if (error.message.includes("slug")) {
        return { success: false, error: "A blog post with this slug already exists. Please choose a different title or customize the slug." };
      }
      return { success: false, error: "A duplicate record was found. Please make sure all unique fields (like slug) are distinct." };
    }
    return { 
      success: false, 
      error: error?.message || "Failed to create blog." 
    };
  }
}

export async function updateBlog(id: string, data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  author?: string | null;
  published: boolean;
  categoryIds?: string[];
  seoMeta?: any;
}) {
  try {
    const { categoryIds, seoMeta, ...blogData } = data;

    const slug = await generateUniqueSlug(blogData.slug || blogData.title || "post", id);
    blogData.slug = slug;
    await db.update(blogs).set({
      ...blogData,
      featuredImage: blogData.featuredImage || null,
      excerpt: blogData.excerpt || null,
      author: blogData.author || null,
      seoMeta: seoMeta || null,
      updatedAt: new Date(),
    }).where(eq(blogs.id, id));

    // Update categories junction table
    await db.delete(blogCategories).where(eq(blogCategories.blogId, id));
    if (categoryIds && categoryIds.length > 0) {
      await db.insert(blogCategories).values(
        categoryIds.map((catId) => ({
          blogId: id,
          categoryId: catId,
        }))
      );
    }

    revalidatePath("/admin/blogs");
    revalidatePath(`/admin/blogs/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating blog:", error);
    if (error?.message?.includes("Duplicate entry") || error?.code === "ER_DUP_ENTRY") {
      if (error.message.includes("slug")) {
        return { success: false, error: "A blog post with this slug already exists. Please choose a different title or customize the slug." };
      }
      return { success: false, error: "A duplicate record was found. Please make sure all unique fields (like slug) are distinct." };
    }
    return { success: false, error: error?.message || "Failed to update blog." };
  }
}

export async function deleteBlog(id: string) {
  try {
    // Delete categories junction records
    await db.delete(blogCategories).where(eq(blogCategories.blogId, id));
    // Delete blog post itself
    await db.delete(blogs).where(eq(blogs.id, id));
    
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return { success: false, error: "Failed to delete blog." };
  }
}
