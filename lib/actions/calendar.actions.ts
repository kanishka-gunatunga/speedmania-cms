"use server";

import { db } from "@/lib/db";
import { calendarEvents } from "@/lib/db/schema";
import { eq, desc, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCalendarEvents(tabType?: string) {
  try {
    const filters: any = [];
    if (tabType) {
      filters.push(eq(calendarEvents.tabType, tabType));
    }

    const events = await db.select()
      .from(calendarEvents)
      .where(filters.length > 0 ? filters[0] : undefined) // Assuming tabType is the only filter for now
      .orderBy(desc(calendarEvents.createdAt));
      
    return events;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw new Error("Failed to fetch calendar events");
  }
}

export async function getAdminCalendarEvents(q: string = "", page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit;

    const filters = q
      ? or(
          like(calendarEvents.title, `%${q}%`),
          like(calendarEvents.subtitle, `%${q}%`),
          like(calendarEvents.series, `%${q}%`)
        )
      : undefined;

    const events = await db.select()
      .from(calendarEvents)
      .where(filters)
      .orderBy(desc(calendarEvents.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(calendarEvents)
      .where(filters);
      
    const total = Number(totalResult[0]?.count || 0);

    return { events, total };
  } catch (error) {
    console.error("Error fetching admin calendar events:", error);
    return { events: [], total: 0 };
  }
}

export async function getCalendarEventById(id: string) {
  try {
    const event = await db.select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id))
      .limit(1);
    
    return event[0] || null;
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    throw new Error("Failed to fetch calendar event");
  }
}

export async function createCalendarEvent(data: {
  round: string;
  dateRange: string;
  status: string;
  title: string;
  subtitle: string;
  series: string;
  tabType: string;
}) {
  try {
    await db.insert(calendarEvents).values(data);
    revalidatePath("/admin/calendar");
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: "Failed to create calendar event" };
  }
}

export async function updateCalendarEvent(id: string, data: {
  round: string;
  dateRange: string;
  status: string;
  title: string;
  subtitle: string;
  series: string;
  tabType: string;
}) {
  try {
    await db.update(calendarEvents)
      .set(data)
      .where(eq(calendarEvents.id, id));
      
    revalidatePath("/admin/calendar");
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return { success: false, error: "Failed to update calendar event" };
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    revalidatePath("/admin/calendar");
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return { success: false, error: "Failed to delete calendar event" };
  }
}
