"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCalendarEvent } from "@/lib/actions/calendar.actions";

export function DeleteCalendarButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      startTransition(async () => {
        const result = await deleteCalendarEvent(id);
        if (!result.success) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
