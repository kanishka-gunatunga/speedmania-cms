"use client";

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
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

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  trackImage: z.string().optional(),
  circuitLength: z.string().optional(),
  firstGrandPrix: z.coerce.number().optional(),
  numberOfLaps: z.coerce.number().optional(),
  fastestLapTime: z.string().optional(),
  raceDistance: z.string().optional(),
  faqs: z.array(faqSchema).default([]),
});

type CircuitFormValues = z.infer<typeof formSchema>;

interface CircuitFormProps {
  initialData?: any;
}

export function CircuitForm({ initialData }: CircuitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CircuitFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      trackImage: initialData?.trackImage ?? "",
      circuitLength: initialData?.circuitLength ?? "",
      firstGrandPrix: initialData?.firstGrandPrix ?? 0,
      numberOfLaps: initialData?.numberOfLaps ?? 0,
      fastestLapTime: initialData?.fastestLapTime ?? "",
      raceDistance: initialData?.raceDistance ?? "",
      faqs: (initialData?.faqs || []).map((faq: any) => ({
        question: faq.question ?? "",
        answer: faq.answer ?? "",
      })),
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
        if (initialData?.id) {
          result = await updateCircuit(initialData.id, data);
        } else {
          result = await createCircuit(data);
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
                <FormField
                  control={form.control}
                  name="trackImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Track Layout Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/track.png" {...field} />
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


