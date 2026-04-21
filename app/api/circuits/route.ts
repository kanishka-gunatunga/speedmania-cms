import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { circuits, circuitFaqs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.query.circuits.findMany({
      with: {
        faqs: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CIRCUITS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
