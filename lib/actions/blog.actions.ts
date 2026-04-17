"use server";

import { revalidatePath } from "next/cache";
import { db, blogs } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

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
    return blog[0] || null;
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
}) {
  try {
    const id = crypto.randomUUID();
    await db.insert(blogs).values({
      id,
      ...data,
      featuredImage: data.featuredImage || null,
      excerpt: data.excerpt || null,
      author: data.author || null,
    });
    
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
}) {
  try {
    await db.update(blogs).set({
      ...data,
      featuredImage: data.featuredImage || null,
      excerpt: data.excerpt || null,
      author: data.author || null,
      updatedAt: new Date(),
    }).where(eq(blogs.id, id));

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
    await db.delete(blogs).where(eq(blogs.id, id));
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return { success: false, error: "Failed to delete blog." };
  }
}
