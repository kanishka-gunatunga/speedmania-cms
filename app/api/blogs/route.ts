import { db, blogs } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        excerpt: blogs.excerpt,
        featuredImage: blogs.featuredImage,
        author: blogs.author,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
      })
      .from(blogs)
      .where(eq(blogs.published, true))
      .orderBy(desc(blogs.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_BLOGS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
