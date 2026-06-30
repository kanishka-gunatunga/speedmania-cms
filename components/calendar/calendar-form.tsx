"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createCalendarEvent, updateCalendarEvent } from "@/lib/actions/calendar.actions";
import { ImageUploadField } from "@/components/ui/image-upload-field";

// Form Schema
const formSchema = z.object({
  round: z.string().min(1, { message: "Round is required" }),
  dateRange: z.string().min(1, { message: "Date range is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().min(1, { message: "Subtitle is required" }),
  series: z.string().min(1, { message: "Series is required" }),
  logoUrl: z.string().optional().or(z.literal("")),
  tabType: z.string().min(1, { message: "Tab type is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
});

type CalendarFormValues = z.infer<typeof formSchema>;

interface CalendarFormProps {
  initialData?: {
    id: string;
    round: string;
    dateRange: string;
    status: string;
    title: string;
    subtitle: string;
    series: string;
    logoUrl?: string | null;
    tabType: string;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
  } | null;
}

export function CalendarForm({ initialData }: CalendarFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      logoUrl: initialData.logoUrl || "",
      startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 10) : "",
      endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 10) : "",
    } : {
      round: "",
      dateRange: "",
      status: "FINISHED",
      title: "",
      subtitle: "",
      series: "",
      logoUrl: "",
      tabType: "INTL",
      startDate: "",
      endDate: "",
    },
  });

  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");

  useEffect(() => {
    if (watchedStartDate && watchedEndDate) {
      const start = new Date(watchedStartDate);
      const end = new Date(watchedEndDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const startDay = String(start.getDate()).padStart(2, "0");
        const startMonth = months[start.getMonth()];
        const endDay = String(end.getDate()).padStart(2, "0");
        const endMonth = months[end.getMonth()];
        
        let dateRangeStr = "";
        if (startMonth === endMonth && startDay === endDay) {
          dateRangeStr = `${startDay} ${startMonth}`;
        } else {
          dateRangeStr = `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
        }
        form.setValue("dateRange", dateRangeStr);
      }
    }
  }, [watchedStartDate, watchedEndDate, form]);

  async function onSubmit(data: CalendarFormValues) {
    setError(null);
    startTransition(async () => {
      let result;
      const payload = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      };

      if (initialData?.id) {
        result = await updateCalendarEvent(initialData.id, payload);
      } else {
        result = await createCalendarEvent(payload);
      }

      if (result.success) {
        router.push("/admin/calendar");
        router.refresh();
      } else {
        setError(result.error || "Something went wrong.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="round"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Round</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., R1" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Range</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 27 FEB - 01 MAR" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Automatically generated from Start Date and End Date.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 1 THAILAND" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PT GRAND PRIX OF THAILAND" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="FINISHED">FINISHED</option>
                    <option value="UP NEXT">UP NEXT</option>
                    <option value="TBA">TBA</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="series"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Series</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., MotoGP, F1, WRC" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tabType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tab Category</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="INTL">International (INTL)</option>
                    <option value="LK">Sri Lanka (LK)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Event/Series Logo Image (Optional)</FormLabel>
                <FormControl>
                  <ImageUploadField
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Provide logo URL or upload image"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/calendar")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : initialData ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
