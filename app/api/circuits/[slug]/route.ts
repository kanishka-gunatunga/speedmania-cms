import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { circuits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 });
    }

    const circuit = await db.query.circuits.findFirst({
      where: eq(circuits.slug, slug),
      with: {
        faqs: true,
      },
    });

    if (!circuit) {
      return new NextResponse("Circuit not found", { status: 404 });
    }

    return NextResponse.json(circuit);
  } catch (error) {
    console.error("[CIRCUIT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
