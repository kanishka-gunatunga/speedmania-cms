import { CalendarForm } from "@/components/calendar/calendar-form";

export default function NewCalendarEventPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Create Calendar Event</h1>
        <p className="text-muted-foreground mt-2">Add a new racing event to the 2026 calendar.</p>
      </div>

      <CalendarForm />
    </div>
  );
}
