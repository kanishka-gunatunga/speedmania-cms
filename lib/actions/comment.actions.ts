"use server";

import { revalidatePath } from "next/cache";
import { db, comments, users } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function getCommentsByBlogId(blogId: string) {
  try {
    const list = await db
      .select({
        id: comments.id,
        content: comments.content,
        approved: comments.approved,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          username: users.username,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.blogId, blogId))
      .orderBy(desc(comments.createdAt));

    return list;
  } catch (error) {
    console.error("[GET_COMMENTS_BY_BLOG_ID_ACTION_ERROR]", error);
    throw new Error("Failed to fetch comments for the blog");
  }
}

export async function approveComment(commentId: string, blogId: string) {
  try {
    await db
      .update(comments)
      .set({ approved: true, updatedAt: new Date() })
      .where(eq(comments.id, commentId));

    revalidatePath(`/admin/blogs/${blogId}`);
    return { success: true };
  } catch (error) {
    console.error("[APPROVE_COMMENT_ACTION_ERROR]", error);
    return { success: false, error: "Failed to approve comment" };
  }
}

export async function deleteComment(commentId: string, blogId: string) {
  try {
    await db.delete(comments).where(eq(comments.id, commentId));

    revalidatePath(`/admin/blogs/${blogId}`);
    return { success: true };
  } catch (error) {
    console.error("[DELETE_COMMENT_ACTION_ERROR]", error);
    return { success: false, error: "Failed to delete comment" };
  }
}
