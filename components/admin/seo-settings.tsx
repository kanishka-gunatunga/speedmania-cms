"use client";

import { UseFormReturn } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/ui/image-upload-field";

import * as z from "zod";

export const seoMetaSchema = {
  seoMeta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
    ogImage: z.string().optional(),
  }).optional(),
};

interface SeoSettingsProps {
  form: UseFormReturn<any>;
}

export function SeoSettings({ form }: SeoSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3 rounded-lg border p-4 shadow-sm bg-muted/10">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left focus:outline-none group"
      >
        <div className="space-y-1">
          <FormLabel className="text-base font-semibold cursor-pointer group-hover:text-primary transition-colors">
            SEO Settings
          </FormLabel>
          <FormDescription className="cursor-pointer">
            Configure custom SEO metadata for this specific item. If left empty, global or default tags will be used.
          </FormDescription>
        </div>
        <div className="text-muted-foreground group-hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted/80">
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ease-in-out ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="pt-4 border-t border-border flex flex-col gap-6">
          <FormField
            control={form.control}
            name="seoMeta.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title</FormLabel>
                <FormControl>
                  <Input placeholder="Custom SEO Title" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoMeta.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description for search engines..."
                    className="resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoMeta.keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. racing, formula 1, speed" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoMeta.ogImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Open Graph Image</FormLabel>
                <FormControl>
                  <ImageUploadField
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
