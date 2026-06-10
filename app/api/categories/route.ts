import { db, categories } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
        type: categories.type,
      })
      .from(categories);

    let data;
    if (type) {
      data = await query.where(eq(categories.type, type)).orderBy(asc(categories.name));
    } else {
      data = await query.orderBy(asc(categories.name));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_CATEGORIES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
