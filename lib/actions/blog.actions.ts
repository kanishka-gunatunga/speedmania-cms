"use server";

import { revalidatePath } from "next/cache";
import { db, blogs, blogCategories, categories } from "@/lib/db";
import { desc, eq, and } from "drizzle-orm";

export async function getBlogs() {
  try {
    const allBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
    return allBlogs;
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

export async function createBlog(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  author?: string | null;
  published: boolean;
  categoryIds?: string[];
}) {
  try {
    const id = crypto.randomUUID();
    const { categoryIds, ...blogData } = data;
    await db.insert(blogs).values({
      id,
      ...blogData,
      featuredImage: blogData.featuredImage || null,
      excerpt: blogData.excerpt || null,
      author: blogData.author || null,
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
    return { 
      success: false, 
      error: error?.message || "Failed to create blog. Slug might not be unique." 
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
}) {
  try {
    const { categoryIds, ...blogData } = data;
    await db.update(blogs).set({
      ...blogData,
      featuredImage: blogData.featuredImage || null,
      excerpt: blogData.excerpt || null,
      author: blogData.author || null,
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
  } catch (error) {
    console.error("Error updating blog:", error);
    return { success: false, error: "Failed to update blog." };
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
