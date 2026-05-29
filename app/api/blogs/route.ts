import { db, blogs, categories, blogCategories } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let limit: number | undefined = undefined;
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Fetch published blogs joined with category information in a single query
    const rawData = await db
      .select({
        blogId: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        excerpt: blogs.excerpt,
        featuredImage: blogs.featuredImage,
        author: blogs.author,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(blogs)
      .leftJoin(blogCategories, eq(blogCategories.blogId, blogs.id))
      .leftJoin(categories, eq(categories.id, blogCategories.categoryId))
      .where(eq(blogs.published, true))
      .orderBy(desc(blogs.createdAt));

    // Group the joined rows by blog ID
    const blogsMap = new Map();
    for (const row of rawData) {
      if (!blogsMap.has(row.blogId)) {
        blogsMap.set(row.blogId, {
          id: row.blogId,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          featuredImage: row.featuredImage,
          author: row.author,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          categories: [],
        });
      }
      if (row.categoryId) {
        blogsMap.get(row.blogId).categories.push({
          id: row.categoryId,
          name: row.categoryName,
          slug: row.categorySlug,
        });
      }
    }

    let data = Array.from(blogsMap.values());
    if (limit !== undefined && !isNaN(limit)) {
      data = data.slice(0, limit);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API_BLOGS_GET] Initial fetch failed:", error);
    
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.message?.includes("doesn't exist")) {
      try {
        console.log("Self-healing: Creating categories and blog_categories tables...");
        const queries = [
          `CREATE TABLE IF NOT EXISTS \`categories\` (
            \`id\` varchar(191) NOT NULL,
            \`name\` varchar(100) NOT NULL,
            \`slug\` varchar(191) NOT NULL,
            \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT \`categories_id\` PRIMARY KEY(\`id\`),
            CONSTRAINT \`categories_name_unique\` UNIQUE(\`name\`),
            CONSTRAINT \`categories_slug_unique\` UNIQUE(\`slug\`)
          );`,
          `CREATE TABLE IF NOT EXISTS \`blog_categories\` (
            \`blog_id\` varchar(191) NOT NULL,
            \`category_id\` varchar(191) NOT NULL,
            CONSTRAINT \`blog_categories_pk\` PRIMARY KEY(\`blog_id\`, \`category_id\`)
          );`
        ];
        
        const { sql } = await import("drizzle-orm");
        for (const q of queries) {
          await db.execute(sql.raw(q));
        }

        // Retry query after table creation
        const rawData = await db
          .select({
            blogId: blogs.id,
            title: blogs.title,
            slug: blogs.slug,
            excerpt: blogs.excerpt,
            featuredImage: blogs.featuredImage,
            author: blogs.author,
            createdAt: blogs.createdAt,
            updatedAt: blogs.updatedAt,
            categoryId: categories.id,
            categoryName: categories.name,
            categorySlug: categories.slug,
          })
          .from(blogs)
          .leftJoin(blogCategories, eq(blogCategories.blogId, blogs.id))
          .leftJoin(categories, eq(categories.id, blogCategories.categoryId))
          .where(eq(blogs.published, true))
          .orderBy(desc(blogs.createdAt));

        const blogsMap = new Map();
        for (const row of rawData) {
          if (!blogsMap.has(row.blogId)) {
            blogsMap.set(row.blogId, {
              id: row.blogId,
              title: row.title,
              slug: row.slug,
              excerpt: row.excerpt,
              featuredImage: row.featuredImage,
              author: row.author,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
              categories: [],
            });
          }
          if (row.categoryId) {
            blogsMap.get(row.blogId).categories.push({
              id: row.categoryId,
              name: row.categoryName,
              slug: row.categorySlug,
            });
          }
        }

        let data = Array.from(blogsMap.values());
        if (limit !== undefined && !isNaN(limit)) {
          data = data.slice(0, limit);
        }
        return NextResponse.json(data);
      } catch (retryErr) {
        console.error("Self-healing query failed:", retryErr);
      }
    }

    // Return empty array fallback so frontend never crashes or shows white screens
    return NextResponse.json([]);
  }
}
