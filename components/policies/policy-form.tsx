"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "../blogs/blog-editor";
import { updatePolicy } from "@/lib/actions/policy.actions";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(20, {
    message: "Content must be at least 20 characters.",
  }),
});

type PolicyFormValues = z.infer<typeof formSchema>;

interface PolicyFormProps {
  initialData: {
    id: string;
    title: string;
    content: string;
  };
}

export function PolicyForm({ initialData }: PolicyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData.title,
      content: initialData.content,
    },
  });

  function onSubmit(data: PolicyFormValues) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await updatePolicy(initialData.id, data);

        if (result?.success) {
          router.push("/admin/policies");
          router.refresh();
        } else {
          setError(result?.error || "An error occurred");
        }
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
          {error}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Title</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Privacy Policy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HTML / Markdown Content</FormLabel>
                <FormControl>
                  <BlogEditor value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/policies")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Policy"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
