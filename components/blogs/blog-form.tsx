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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Switch } from "@/components/ui/switch";
import { BlogEditor } from "./blog-editor";
import { createBlog, updateBlog } from "@/lib/actions/blog.actions";

// Form Schema
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric and can contain hyphens.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  excerpt: z.string().optional(),
  featuredImage: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal("")),
  author: z.string().optional(),
  published: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
});

type BlogFormValues = z.infer<typeof formSchema>;

interface BlogFormProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    author?: string | null;
    published?: boolean;
    categories?: { id: string; name: string; slug: string }[];
  };
  categories: { id: string; name: string; slug: string }[];
}

export function BlogForm({ initialData, categories = [] }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      featuredImage: initialData?.featuredImage || "",
      author: initialData?.author || "",
      published: !!initialData?.published,
      categoryIds: initialData?.categories?.map(c => c.id) || [],
    },
  });

  function onSubmit(data: BlogFormValues) {
    setError(null);
    startTransition(async () => {
      try {
        let result;
        if (initialData?.id) {
          result = await updateBlog(initialData.id, data);
        } else {
          result = await createBlog(data);
        }

        if (result?.success) {
          router.push("/admin/blogs");
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., How to win a race" {...field} onChange={(e) => {
                      field.onChange(e);
                      if (!initialData && form.getValues("slug") === "") {
                        form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g-how-to-win-a-race" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique URL identifier for the blog.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of the blog post..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Lewis Hamilton" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem className="space-y-3 rounded-lg border p-4 shadow-sm bg-muted/20">
                <div>
                  <FormLabel className="text-base font-semibold">Categories</FormLabel>
                  <FormDescription>
                    Assign this blog post to one or more categories.
                  </FormDescription>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {categories.map((category) => {
                    const isChecked = field.value?.includes(category.id);
                    return (
                      <div
                        key={category.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <input
                          type="checkbox"
                          id={`cat-${category.id}`}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={isChecked}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const value = field.value || [];
                            if (checked) {
                              field.onChange([...value, category.id]);
                            } else {
                              field.onChange(value.filter((val) => val !== category.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`cat-${category.id}`}
                          className="text-sm font-medium leading-none cursor-pointer select-none"
                        >
                          {category.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">Published Status</FormLabel>
                  <FormDescription>
                    {field.value 
                      ? "This post will be visible on the public website." 
                      : "This post will be kept as a draft."}
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

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
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
              onClick={() => router.push("/admin/blogs")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : (initialData ? "Update Blog" : "Create Blog")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
