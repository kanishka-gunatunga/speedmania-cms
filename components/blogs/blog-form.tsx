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
import { ChevronDown } from "lucide-react";
import { SeoSettings } from "@/components/admin/seo-settings";
import { ImageUploadField } from "@/components/ui/image-upload-field";

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
  content: z.string().min(100, {
    message: "Content must be at least 100 characters.",
  }),
  excerpt: z.string().optional(),
  featuredImage: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal("")),
  author: z.string().optional(),
  published: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
  seoMeta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
    ogImage: z.string().optional(),
  }).optional(),
  createdAt: z.string().optional(),
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
    seoMeta?: any;
    categories?: { id: string; name: string; slug: string; parentId?: string | null }[];
    createdAt?: Date | string | null;
  };
  categories: { id: string; name: string; slug: string; parentId?: string | null }[];
}

export function BlogForm({ initialData, categories = [] }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

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
      seoMeta: initialData?.seoMeta || { title: "", description: "", keywords: "", ogImage: "" },
      createdAt: initialData?.createdAt ? (() => {
        const d = new Date(initialData.createdAt);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
      })() : "",
    },
  });

  function onSubmit(data: BlogFormValues) {
    setError(null);
    startTransition(async () => {
      try {
        let finalCreatedAt = data.createdAt ? new Date(data.createdAt) : undefined;
        // Auto-set to current date if published and no manual date provided, and wasn't published before
        if (data.published && !data.createdAt && !initialData?.published) {
          finalCreatedAt = new Date();
        }

        const payload = {
          ...data,
          createdAt: finalCreatedAt,
        };

        let result;
        if (initialData?.id) {
          result = await updateBlog(initialData.id, payload);
        } else {
          result = await createBlog(payload);
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
                  <FormLabel>Featured Image</FormLabel>
                  <FormControl>
                    <ImageUploadField
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="https://example.com/image.jpg"
                    />
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
            render={({ field }) => {
              // Group categories into parent-child structure
              const parentCategories = categories.filter((c) => !c.parentId);
              const childCategoriesMap = categories.reduce((acc, cat) => {
                if (cat.parentId) {
                  if (!acc[cat.parentId]) acc[cat.parentId] = [];
                  acc[cat.parentId].push(cat);
                }
                return acc;
              }, {} as Record<string, typeof categories>);

              const selectedCategoryNames = categories
                .filter((c) => field.value?.includes(c.id))
                .map((c) => c.name);

              return (
                <FormItem className="space-y-3 rounded-lg border p-4 shadow-sm bg-muted/20">
                  <button
                    type="button"
                    onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                    className="flex items-center justify-between w-full text-left focus:outline-none group"
                  >
                    <div className="space-y-1">
                      <FormLabel className="text-base font-semibold cursor-pointer group-hover:text-primary transition-colors">
                        Categories
                      </FormLabel>
                      <FormDescription className="cursor-pointer">
                        Assign this blog post to one or more categories.
                      </FormDescription>
                      
                      {/* Selected categories summary when collapsed */}
                      {!isCategoryExpanded && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {selectedCategoryNames.length > 0 ? (
                            selectedCategoryNames.map((name) => (
                              <span
                                key={name}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                              >
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              None selected (click to expand and select)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-muted-foreground group-hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted/80">
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ease-in-out ${
                          isCategoryExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Render panel only when expanded */}
                  {isCategoryExpanded && (
                    <div className="pt-4 border-t border-border flex flex-col gap-4">
                      {parentCategories.map((parent) => {
                        const children = childCategoriesMap[parent.id] || [];
                        const isParentChecked = field.value?.includes(parent.id);
                        return (
                          <div key={parent.id} className="space-y-2">
                            {/* Parent Category */}
                            <div className="flex flex-row items-center space-x-3 space-y-0">
                              <input
                                type="checkbox"
                                id={`cat-${parent.id}`}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                checked={isParentChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const value = field.value || [];
                                  if (checked) {
                                    field.onChange([...value, parent.id]);
                                  } else {
                                    const childIds = children.map((c) => c.id);
                                    field.onChange(value.filter((val) => val !== parent.id && !childIds.includes(val)));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`cat-${parent.id}`}
                                className="text-sm font-bold leading-none cursor-pointer select-none text-foreground"
                              >
                                {parent.name}
                              </label>
                            </div>

                            {/* Indented Children Categories */}
                            {children.length > 0 && (
                              <div className="pl-6 border-l border-border/60 ml-2 space-y-2 flex flex-col pt-1">
                                {children.map((child) => {
                                  const isChildChecked = field.value?.includes(child.id);
                                  return (
                                    <div
                                      key={child.id}
                                      className="flex flex-row items-center space-x-3 space-y-0"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`cat-${child.id}`}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        checked={isChildChecked}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          const value = field.value || [];
                                          if (checked) {
                                            field.onChange([...value, child.id]);
                                          } else {
                                            field.onChange(value.filter((val) => val !== child.id));
                                          }
                                        }}
                                      />
                                      <label
                                        htmlFor={`cat-${child.id}`}
                                        className="text-sm font-medium leading-none cursor-pointer select-none text-muted-foreground hover:text-foreground"
                                      >
                                        {child.name}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Render orphan sub-categories (fallback safety) */}
                      {categories
                        .filter((c) => c.parentId && !categories.some((p) => p.id === c.parentId))
                        .map((orphan) => {
                          const isOrphanChecked = field.value?.includes(orphan.id);
                          return (
                            <div
                              key={orphan.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <input
                                type="checkbox"
                                id={`cat-${orphan.id}`}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                checked={isOrphanChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const value = field.value || [];
                                  if (checked) {
                                    field.onChange([...value, orphan.id]);
                                  } else {
                                    field.onChange(value.filter((val) => val !== orphan.id));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`cat-${orphan.id}`}
                                className="text-sm font-medium leading-none cursor-pointer select-none"
                              >
                                {orphan.name}
                              </label>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
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
            name="createdAt"
            render={({ field }) => (
              <FormItem className="rounded-lg border p-4 shadow-sm bg-muted/20">
                <FormLabel className="text-base font-semibold">Published Date (Optional)</FormLabel>
                <FormDescription className="mb-3">
                  Set a manual back-date for when this post was published. Leave empty to automatically use the current date when published.
                </FormDescription>
                <FormControl>
                  <Input type="datetime-local" {...field} className="w-fit" />
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
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <BlogEditor value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SeoSettings form={form} />

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
