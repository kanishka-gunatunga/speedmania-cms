import { db, blogs, categories, blogCategories } from "@/lib/db";
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

    const blogData = data[0];
    let categoriesList: any[] = [];
    try {
      categoriesList = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .innerJoin(blogCategories, eq(blogCategories.categoryId, categories.id))
        .where(eq(blogCategories.blogId, blogData.id));
    } catch (innerError: any) {
      console.error("[API_BLOG_DETAIL_GET] Inner categories query failed:", innerError);
      if (innerError?.code === "ER_NO_SUCH_TABLE" || innerError?.message?.includes("doesn't exist")) {
        try {
          console.log("Self-healing: Creating categories and blog_categories tables from detail route...");
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
          
          categoriesList = await db
            .select({
              id: categories.id,
              name: categories.name,
              slug: categories.slug,
            })
            .from(categories)
            .innerJoin(blogCategories, eq(blogCategories.categoryId, categories.id))
            .where(eq(blogCategories.blogId, blogData.id));
        } catch (retryErr) {
          console.error("Self-healing inside detail route failed:", retryErr);
        }
      }
    }

    return NextResponse.json({
      ...blogData,
      categories: categoriesList,
    });
  } catch (error) {
    console.error("[API_BLOG_DETAIL_GET]", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}
