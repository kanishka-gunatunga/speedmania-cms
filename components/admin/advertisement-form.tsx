"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createAdvertisement, updateAdvertisement } from "@/lib/actions/advertisement.actions";
import { Advertisement } from "@/lib/db/schema";
import { ImageUploadField } from "@/components/ui/image-upload-field";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  imageUrl: z.string().min(1, { message: "An image is required." }),
  linkUrl: z.string().optional(),
  isActive: z.boolean(),
});

export function AdvertisementForm({ initialData }: { initialData?: Advertisement | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      imageUrl: initialData?.imageUrl || "",
      linkUrl: initialData?.linkUrl || "",
      isActive: initialData?.isActive || false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateAdvertisement(initialData.id, values);
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await createAdvertisement(values);
        if (!result.success) throw new Error(result.error);
      }
      
      router.push("/admin/advertisements");
      router.refresh();
    } catch (error: any) {
      alert("Something went wrong: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Advertisement" : "Create Advertisement"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Summer Promo 2026" {...field} />
                  </FormControl>
                  <FormDescription>For internal reference only.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advertisement Image (SVG, PNG, JPG)</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/promo" {...field} />
                  </FormControl>
                  <FormDescription>The URL the user goes to when clicking the advertisement.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Set Active</FormLabel>
                    <FormDescription>
                      Make this the active advertisement. This will automatically deactivate any currently active advertisement.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/admin/advertisements")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : (initialData ? "Update Advertisement" : "Create Advertisement")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
