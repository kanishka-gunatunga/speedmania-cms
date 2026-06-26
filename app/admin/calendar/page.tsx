import { getAdminCalendarEvents } from "@/lib/actions/calendar.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { SearchBar } from "@/components/admin/search-bar";
import { Pagination } from "@/components/admin/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteCalendarButton } from "@/components/admin/delete-calendar-button";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  const qStr = Array.isArray(resolvedParams.q) ? resolvedParams.q[0] : resolvedParams.q;
  const q = qStr || "";
  
  const pageStr = Array.isArray(resolvedParams.page) ? resolvedParams.page[0] : resolvedParams.page;
  const page = parseInt(pageStr || "1", 10) || 1;
  const limit = 10;

  const { events, total } = await getAdminCalendarEvents(q, page, limit);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Calendar Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage 2026 racing events for the calendar.</p>
        </div>
        <Link href="/admin/calendar/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            You have {total} calendar events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar placeholder="Search events by title, subtitle or series..." />
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead>Tab Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No events found. Create one!
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.round}</TableCell>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.dateRange}</TableCell>
                      <TableCell>{event.series}</TableCell>
                      <TableCell>{event.tabType}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {event.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/calendar/${event.id}`}>
                            <Button variant="ghost" size="icon" className="hover:text-blue-500">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DeleteCalendarButton id={event.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination totalPages={Math.max(1, Math.ceil(total / limit)) || 1} currentPage={page || 1} />
        </CardContent>
      </Card>
    </div>
  );
}
