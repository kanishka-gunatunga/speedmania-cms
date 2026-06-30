import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { policies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.query.policies.findFirst({
      where: eq(policies.id, id),
    });

    if (!result) {
      return NextResponse.json(null);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[POLICY_GET]`, error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
