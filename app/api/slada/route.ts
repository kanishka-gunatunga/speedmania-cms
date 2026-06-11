import { getSladaContent } from "@/lib/actions/slada.actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getSladaContent();
    if (result.success) {
      return NextResponse.json({
        page: result.page,
        committee: result.committee,
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[API_SLADA_GET]", error);
    return NextResponse.json({ error: "Failed to fetch SLADA page content" }, { status: 500 });
  }
}
