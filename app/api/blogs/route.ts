import { db, blogs } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const baseQuery = db
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

    const data = await (limit !== undefined && !isNaN(limit) ? baseQuery.limit(limit) : baseQuery);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_BLOGS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
