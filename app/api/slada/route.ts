import { getSladaContent } from "@/lib/actions/slada.actions";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "slada";
    
    const result = await getSladaContent(category);
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
