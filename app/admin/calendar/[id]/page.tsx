import { CalendarForm } from "@/components/calendar/calendar-form";
import { getCalendarEventById } from "@/lib/actions/calendar.actions";
import { notFound } from "next/navigation";

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCalendarEventPage({ params }: EditPageProps) {
  const resolvedParams = await params;
  const event = await getCalendarEventById(resolvedParams.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Calendar Event</h1>
        <p className="text-muted-foreground mt-2">Update an existing racing event on the 2026 calendar.</p>
      </div>

      <CalendarForm initialData={event} />
    </div>
  );
}
