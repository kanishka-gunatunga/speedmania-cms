import { db, blogs } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const data = await db
      .select()
      .from(blogs)
      .where(
        and(
          eq(blogs.slug, slug),
          eq(blogs.published, true)
        )
      )
      .limit(1);

    if (data.length === 0) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("[API_BLOG_DETAIL_GET]", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}
