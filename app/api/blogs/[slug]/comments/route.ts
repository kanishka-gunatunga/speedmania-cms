import { db, blogs, comments, users } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/crypto.edge";

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

    // Find the blog
    const blogList = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
    if (blogList.length === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    const blog = blogList[0];

    // Fetch approved comments with user info
    const commentsList = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          username: users.username,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.blogId, blog.id),
          eq(comments.approved, true)
        )
      )
      .orderBy(desc(comments.createdAt));

    return NextResponse.json(commentsList);
  } catch (error: any) {
    console.error("[GET_COMMENTS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Find the blog
    const blogList = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
    if (blogList.length === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    const blog = blogList[0];

    const commentId = crypto.randomUUID();
    await db.insert(comments).values({
      id: commentId,
      blogId: blog.id,
      userId: authUser.id,
      content: content.trim(),
      approved: false, // Moderated by default
    });

    return NextResponse.json({
      success: true,
      message: "Comment submitted and awaiting approval",
      comment: {
        id: commentId,
        content: content.trim(),
        approved: false,
      },
    });
  } catch (error: any) {
    console.error("[POST_COMMENT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
