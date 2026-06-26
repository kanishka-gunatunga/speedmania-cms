import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/actions/calendar.actions";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tabType = searchParams.get("tabType") || undefined;
    
    const events = await getCalendarEvents(tabType);
    return NextResponse.json(events);
  } catch (error) {
    console.error("API error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
