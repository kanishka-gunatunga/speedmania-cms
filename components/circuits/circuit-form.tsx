"use client";

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Plus, Trash2, Globe, MapPin, Gauge, History } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BlogEditor } from "../blogs/blog-editor";
import { createCircuit, updateCircuit } from "@/lib/actions/circuit.actions";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { SeoSettings, seoMetaSchema } from "@/components/admin/seo-settings";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  trackImage: z.string().optional(),
  aboutImage: z.string().optional(),
  galleryImages: z.string().optional(),
  circuitLength: z.string().optional(),
  firstGrandPrix: z.coerce.number().optional(),
  numberOfLaps: z.coerce.number().optional(),
  fastestLapTime: z.string().optional(),
  fastestLapDriver: z.string().optional(),
  fastestLapYear: z.coerce.number().optional(),
  raceDistance: z.string().optional(),
  racingCategory: z.string().optional(),
  faqs: z.array(faqSchema).default([]),
  seoMeta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
    ogImage: z.string().optional(),
  }).optional(),
});

type CircuitFormValues = z.infer<typeof formSchema>;

interface CircuitFormProps {
  initialData?: any;
}

export function CircuitForm({ initialData }: CircuitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; type: string; parentId?: string | null }[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData?.circuitCategories && categories.length > 0) {
      const initialCatIds = initialData.circuitCategories.map((cc: any) => cc.categoryId);
      setSelectedSubCategoryIds(initialCatIds);

      // Find parentId from the selected subcategories
      const subCats = categories.filter(c => initialCatIds.includes(c.id));
      const parent = subCats.find(c => c.parentId);
      if (parent && parent.parentId) {
        setSelectedParentId(parent.parentId);
      } else {
        const topLevelSelected = categories.find(c => initialCatIds.includes(c.id) && !c.parentId);
        if (topLevelSelected) {
          setSelectedParentId(topLevelSelected.id);
        }
      }
    }
  }, [initialData, categories]);

  const filteredCategories = categories.filter((c) => c.type === "driver" || c.type === "rider");
  const hasCircuitCategories = categories.some((c) => c.type === "circuit");
  const topCategories = categories.filter((c) => !c.parentId && c.type === "circuit");
  const subCategories = categories.filter((c) => c.parentId === selectedParentId && c.type === "circuit");

  const form = useForm<CircuitFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      trackImage: initialData?.trackImage ?? "",
      aboutImage: initialData?.aboutImage ?? "",
      galleryImages: initialData?.galleryImages ?? "",
      circuitLength: initialData?.circuitLength ?? "",
      firstGrandPrix: initialData?.firstGrandPrix ?? 0,
      numberOfLaps: initialData?.numberOfLaps ?? 0,
      fastestLapTime: initialData?.fastestLapTime ?? "",
      fastestLapDriver: initialData?.fastestLapDriver ?? "",
      fastestLapYear: initialData?.fastestLapYear ?? 0,
      raceDistance: initialData?.raceDistance ?? "",
      racingCategory: initialData?.racingCategory ?? "",
      faqs: (initialData?.faqs || []).map((faq: any) => ({
        question: faq.question ?? "",
        answer: faq.answer ?? "",
      })),
      seoMeta: initialData?.seoMeta || { title: "", description: "", keywords: "", ogImage: "" },
    },
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const onSubmit: SubmitHandler<CircuitFormValues> = (data) => {
    setError(null);
    startTransition(async () => {
      try {
        let result;
        const payload = {
          ...data,
          categoryIds: selectedSubCategoryIds,
        };
        if (initialData?.id) {
          result = await updateCircuit(initialData.id, payload);
        } else {
          result = await createCircuit(payload);
        }

        if (result.success) {
          router.push("/admin/circuits");
          router.refresh();
        } else {
          setError(result.error || "An error occurred");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        {error && (
          <div className="p-3 text-sm font-medium bg-destructive/15 text-destructive rounded-md">
            {error}
          </div>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger value="general" className="border border-border py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">General Info</TabsTrigger>
            <TabsTrigger value="technical" className="border border-border py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Technical Stats</TabsTrigger>
            <TabsTrigger value="faq" className="border border-border py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Circuit Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Suzuka Circuit" {...field} onChange={(e) => {
                          field.onChange(e);
                          if (!initialData && form.getValues("slug") === "") {
                            form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                          }
                        }} />
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
                        <Input placeholder="suzuka-circuit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {hasCircuitCategories ? (
                  <>
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <FormControl>
                        <select
                          value={selectedParentId}
                          onChange={(e) => {
                            setSelectedParentId(e.target.value);
                            setSelectedSubCategoryIds([]);
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Category...</option>
                          {topCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>Select the top-level classification (e.g. Domestic or International).</FormDescription>
                    </FormItem>

                    {selectedParentId && (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Sub-Categories (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-xl bg-muted/10">
                          {subCategories.map((sub) => {
                            const checked = selectedSubCategoryIds.includes(sub.id);
                            return (
                              <label key={sub.id} className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSubCategoryIds((prev) => [...prev, sub.id]);
                                    } else {
                                      setSelectedSubCategoryIds((prev) => prev.filter((id) => id !== sub.id));
                                    }
                                  }}
                                  className="rounded border-input text-primary focus:ring-ring h-4.5 w-4.5"
                                />
                                <span>{sub.name}</span>
                              </label>
                            );
                          })}
                          {subCategories.length === 0 && (
                            <p className="text-sm text-muted-foreground italic col-span-full">
                              No sub-categories defined for this category. Go to Circuit Categories to add some.
                            </p>
                          )}
                        </div>
                      </FormItem>
                    )}
                  </>
                ) : (
                  <FormField
                    control={form.control}
                    name="racingCategory"
                    render={({ field }) => {
                      const val = field.value || "";
                      const isInternational = ["f1", "formula 1", "formula-1", "motogp", "wec", "wrc"].some((intl) =>
                        val.toLowerCase().includes(intl)
                      );
                      return (
                        <FormItem>
                          <FormLabel>Racing Category</FormLabel>
                          <FormControl>
                            {filteredCategories.length > 0 ? (
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="">Select Category...</option>
                                {filteredCategories.map((c) => (
                                  <option key={c.id} value={c.name}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Input placeholder="E.g. Formula 1, MotoGP, Karting" {...field} />
                            )}
                          </FormControl>
                          <FormDescription>
                            {val ? (
                              <span>
                                Classification:{" "}
                                <strong className={isInternational ? "text-blue-600 font-bold" : "text-emerald-600 font-bold"}>
                                  {isInternational ? "International" : "Domestic"}
                                </strong>
                              </span>
                            ) : (
                              "Select a category to classify the circuit."
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
                 <FormField
                  control={form.control}
                  name="trackImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Track Layout Image</FormLabel>
                      <FormControl>
                        <ImageUploadField
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="https://example.com/track.png"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>About Section Cover Image</FormLabel>
                      <FormControl>
                        <ImageUploadField
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="https://example.com/about.jpg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="galleryImages"
                  render={({ field }) => {
                    const galleryImagesValue = field.value || "";
                    const galleryImagesArray = galleryImagesValue
                      ? galleryImagesValue.split(",").map((img) => img.trim())
                      : [];
                    const slots = Array.from({ length: 4 }, (_, i) => galleryImagesArray[i] || "");

                    return (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Gallery Images (Up to 4)</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                            {slots.map((slotValue, index) => (
                              <div key={index} className="space-y-1.5 p-3.5 border border-border/80 rounded-xl bg-muted/10 shadow-sm animate-in fade-in duration-200">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  Gallery Slot {index + 1}
                                </div>
                                <ImageUploadField
                                  value={slotValue}
                                  onChange={(newUrl) => {
                                    const newSlots = [...slots];
                                    newSlots[index] = newUrl;
                                    const updatedValue = newSlots
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                      .join(",");
                                    field.onChange(updatedValue);
                                  }}
                                  placeholder={`https://example.com/gallery${index + 1}.jpg`}
                                />
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Provide up to 4 high-resolution images by pasting URLs or uploading them directly.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>About Track / Description</FormLabel>
                      <FormControl>
                        <BlogEditor value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="circuitLength"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2 italic text-muted-foreground text-xs uppercase tracking-wider">
                        <Globe className="w-3 h-3" /> Circuit Info
                      </div>
                      <FormLabel>Circuit Length</FormLabel>
                      <FormControl>
                        <Input placeholder="5.807km" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstGrandPrix"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2 italic text-muted-foreground text-xs uppercase tracking-wider">
                        <History className="w-3 h-3" /> History
                      </div>
                      <FormLabel>First Grand Prix</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1987" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfLaps"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-2 italic text-muted-foreground text-xs uppercase tracking-wider">
                        <Gauge className="w-3 h-3" /> Performance
                      </div>
                      <FormLabel>Number of Laps</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="53" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="raceDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Race Distance</FormLabel>
                      <FormControl>
                        <Input placeholder="307.471km" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fastestLapTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fastest Lap Time</FormLabel>
                      <FormControl>
                        <Input placeholder="1:30.965" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fastestLapDriver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fastest Lap Driver</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Max Verstappen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fastestLapYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fastest Lap Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="E.g. 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="faq" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => appendFaq({ question: "", answer: "" })}
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </Button>
            </div>
            <div className="space-y-6">
              {faqFields.map((field, index) => (
                <Card key={field.id} className="relative group">
                  <CardContent className="pt-6 space-y-4 pr-12">
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">Question</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. When was the circuit built?" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.answer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">Answer</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Type the answer here..." className="min-h-[100px]" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFaq(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {faqFields.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
                  No FAQs added yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <SeoSettings form={form} />
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/circuits")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="px-8 font-bold">
            {isPending ? "Saving..." : (initialData ? "Update Circuit" : "Create Circuit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}


