import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageSeo } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pageName: string }> }
) {
  try {
    const { pageName } = await params;
    const result = await db.query.pageSeo.findFirst({
      where: eq(pageSeo.pageName, pageName),
    });

    if (!result) {
      return NextResponse.json(null);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[SEO_GET] ${await params.then(p => p.pageName)}`, error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ pageName: string }> }
) {
  try {
    const { pageName } = await params;
    const body = await req.json();
    const { title, description, keywords, ogImage } = body;

    const existing = await db.query.pageSeo.findFirst({
      where: eq(pageSeo.pageName, pageName),
    });

    if (existing) {
      await db.update(pageSeo)
        .set({ title, description, keywords, ogImage })
        .where(eq(pageSeo.pageName, pageName));
    } else {
      await db.insert(pageSeo).values({
        pageName,
        title,
        description,
        keywords,
        ogImage,
      });
    }

    const updated = await db.query.pageSeo.findFirst({
      where: eq(pageSeo.pageName, pageName),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`[SEO_PUT] ${await params.then(p => p.pageName)}`, error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
