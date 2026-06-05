"use client";

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Plus, Trash2, Shield, BarChart3, Users, HelpCircle } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { createTeam, updateTeam } from "@/lib/actions/team.actions";
import { ImageUploadField } from "@/components/ui/image-upload-field";

const rosterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  image: z.string().optional().default(""),
});

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  subtitle: z.string().optional().default(""),
  category: z.string().min(1, "Category is required"),
  logo: z.string().optional().default(""),
  initials: z.string().optional().default(""),
  gradient: z.string().optional().default("linear-gradient(270deg, #1CFEFD 0%, #009695 100%)"),
  textColor: z.string().optional().default("text-white"),
  accentColor: z.string().optional().default(""),
  memberCardBg: z.string().optional().default(""),
  glowColor: z.string().optional().default(""),
  biography: z.string().optional().default(""),
  profileImage: z.string().optional().default(""),

  // Season Stats
  seasonPosition: z.string().optional().default(""),
  seasonPoints: z.coerce.number().optional().default(0),
  races: z.coerce.number().optional().default(0),
  wins: z.coerce.number().optional().default(0),
  fastestLaps: z.coerce.number().optional().default(0),
  podiums: z.coerce.number().optional().default(0),
  sprintRaces: z.coerce.number().optional().default(0),
  sprintPoints: z.coerce.number().optional().default(0),
  sprintWins: z.coerce.number().optional().default(0),
  sprintPodiums: z.coerce.number().optional().default(0),

  // Summary Stats
  summaryEntered: z.coerce.number().optional().default(0),
  summaryWins: z.string().optional().default("0"),
  highestFinish: z.string().optional().default(""),
  summaryPodiums: z.coerce.number().optional().default(0),
  summaryPoles: z.coerce.number().optional().default(0),
  summaryChampionships: z.coerce.number().optional().default(0),

  // Driver Associations
  driverIds: z.array(z.string()).default([]),

  // Custom Roster
  roster: z.array(rosterSchema).default([]),
});

type TeamFormValues = z.infer<typeof formSchema>;

interface TeamFormProps {
  initialData?: any;
  availableDrivers: any[];
}

export function TeamForm({ initialData, availableDrivers }: TeamFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Parse initial roster if any
  let initialRoster = [];
  if (initialData?.roster) {
    try {
      initialRoster = typeof initialData.roster === "string" 
        ? JSON.parse(initialData.roster) 
        : initialData.roster;
    } catch (e) {
      console.error("Failed to parse custom roster", e);
    }
  }

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      subtitle: initialData?.subtitle ?? "",
      category: initialData?.category ?? "Formula 1",
      logo: initialData?.logo ?? "",
      initials: initialData?.initials ?? "",
      gradient: initialData?.gradient ?? "linear-gradient(270deg, #1CFEFD 0%, #009695 100%)",
      textColor: initialData?.textColor ?? "text-white",
      accentColor: initialData?.accentColor ?? "",
      memberCardBg: initialData?.memberCardBg ?? "",
      glowColor: initialData?.glowColor ?? "",
      biography: initialData?.biography ?? "",
      profileImage: initialData?.profileImage ?? "",
      
      // Season Stats
      seasonPosition: initialData?.seasonPosition ?? "",
      seasonPoints: initialData?.seasonPoints ?? 0,
      races: initialData?.races ?? 0,
      wins: initialData?.wins ?? 0,
      fastestLaps: initialData?.fastestLaps ?? 0,
      podiums: initialData?.podiums ?? 0,
      sprintRaces: initialData?.sprintRaces ?? 0,
      sprintPoints: initialData?.sprintPoints ?? 0,
      sprintWins: initialData?.sprintWins ?? 0,
      sprintPodiums: initialData?.sprintPodiums ?? 0,
      
      // Summary Stats
      summaryEntered: initialData?.summaryEntered ?? 0,
      summaryWins: initialData?.summaryWins ?? "0",
      highestFinish: initialData?.highestFinish ?? "",
      summaryPodiums: initialData?.summaryPodiums ?? 0,
      summaryPoles: initialData?.summaryPoles ?? 0,
      summaryChampionships: initialData?.summaryChampionships ?? 0,
      
      // Driver IDs
      driverIds: initialData?.drivers?.map((d: any) => d.id) ?? [],
      
      // Custom Roster
      roster: initialRoster,
    },
  });

  const { fields: rosterFields, append: appendRoster, remove: removeRoster } = useFieldArray({
    control: form.control,
    name: "roster",
  });

  const onSubmit: SubmitHandler<TeamFormValues> = (data) => {
    setError(null);
    startTransition(async () => {
      try {
        let result;
        if (initialData?.id) {
          result = await updateTeam(initialData.id, data);
        } else {
          result = await createTeam(data);
        }

        if (result.success) {
          router.push("/admin/teams");
          router.refresh();
        } else {
          setError(result.error || "An error occurred");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        {error && (
          <div className="p-3 text-sm font-medium bg-destructive/15 text-destructive rounded-md">
            {error}
          </div>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger value="general" className="border border-border py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">General Info</TabsTrigger>
            <TabsTrigger value="stats" className="border border-border py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Statistics</TabsTrigger>
            <TabsTrigger value="drivers" className="border border-border py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Drivers & Riders</TabsTrigger>
            <TabsTrigger value="roster" className="border border-border py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Custom Staff</TabsTrigger>
          </TabsList>

          {/* GENERAL INFO TAB */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Mora Racing" {...field} onChange={(e) => {
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
                        <Input placeholder="mora-racing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Sri Lankan Karting Team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="Formula 1">Formula 1</option>
                          <option value="Rally">Rally</option>
                          <option value="Supercars">Supercars</option>
                          <option value="Karting">Karting</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo (URL, Upload or "shield")</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="/mora-logo.png or 'shield'" className="flex-1" {...field} />
                          <ImageUploadField value={field.value !== "shield" ? field.value : ""} onChange={(val) => field.onChange(val)} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Use "shield" to render the SVG shield layout with initials on frontend, or provide an image path.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shield Initials</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. MB, SF, MC" maxLength={5} {...field} />
                      </FormControl>
                      <FormDescription>
                        Used only if Logo is set to "shield".
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Gradient (CSS Style)</FormLabel>
                      <FormControl>
                        <Input placeholder="linear-gradient(180deg, #1CFEFD 0%, #009695 100%)" {...field} />
                      </FormControl>
                      <FormDescription>
                        CSS linear-gradient style for team layout headers and cards.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Text Color Class</FormLabel>
                      <FormControl>
                        <Input placeholder="text-white or text-black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color Hex Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. #009695" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memberCardBg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member Card Background Hex Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. #27F4D2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="glowColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hover Glow Shadow Color (RGBA)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. rgba(28, 254, 253, 0.4)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover / Profile Image</FormLabel>
                      <FormControl>
                        <ImageUploadField value={field.value} onChange={field.onChange} placeholder="https://example.com/team-cover.jpg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Team Biography / Profile Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type detailed biography/profile information here..." className="min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* STATISTICS TAB */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b pb-2 mb-4">
                    <BarChart3 className="w-5 h-5" /> 2026 Season Standing Statistics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="seasonPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season Position</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. 5th" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seasonPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season Points</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="51" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="races"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Races</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="wins"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Race Wins</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fastestLaps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fastest Laps</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="podiums"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grand Prix Podiums</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sprintRaces"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sprint Races</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sprintPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sprint Points</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="43" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sprintWins"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sprint Wins</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sprintPodiums"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sprint Podiums</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b pb-2 mb-4">
                    <Shield className="w-5 h-5" /> Team Summary (All Time Stats)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="summaryEntered"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Races Entered</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="384" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="summaryWins"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Race Wins</FormLabel>
                          <FormControl>
                            <Input placeholder="5069.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="highestFinish"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Race Finish</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 1 (x105)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="summaryPodiums"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Podiums</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="203" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="summaryPoles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pole Positions</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="104" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="summaryChampionships"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Championships</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="7" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DRIVERS & RIDERS TAB */}
          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                      <Users className="w-5 h-5" /> Team Athletes
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Select drivers/riders currently representing this team.</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="driverIds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-muted/10">
                        {availableDrivers.map((driver) => {
                          const isChecked = field.value.includes(driver.id);
                          return (
                            <div key={driver.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/10 transition-colors">
                              <input
                                type="checkbox"
                                id={driver.id}
                                checked={isChecked}
                                className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:ring-ring"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, driver.id]);
                                  } else {
                                    field.onChange(field.value.filter((val: string) => val !== driver.id));
                                  }
                                }}
                              />
                              <label htmlFor={driver.id} className="text-sm font-semibold cursor-pointer select-none flex-grow">
                                {driver.fullName}
                                <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                  {driver.racingCategory || "N/A"} • {driver.playerType || "driver"}
                                </span>
                              </label>
                            </div>
                          );
                        })}
                        {availableDrivers.length === 0 && (
                          <div className="col-span-full py-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                            No athletes profiles registered in the system yet.
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* CUSTOM STAFF TAB */}
          <TabsContent value="roster" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Additional Staff / Custom Roster</h3>
                <p className="text-sm text-muted-foreground">Add team managers, advisors, principal directors, etc.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => appendRoster({ name: "", role: "", image: "" })}
              >
                <Plus className="w-4 h-4" />
                Add Staff Member
              </Button>
            </div>

            <div className="space-y-6">
              {rosterFields.map((field, index) => (
                <Card key={field.id} className="relative group">
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pr-12">
                    <FormField
                      control={form.control}
                      name={`roster.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Toto Wolff" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`roster.${index}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Team Principal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`roster.${index}.image`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Photo</FormLabel>
                          <FormControl>
                            <ImageUploadField value={field.value || ""} onChange={field.onChange} placeholder="https://example.com/photo.jpg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeRoster(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {rosterFields.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
                  No custom staff members added. Roster will only display linked drivers/riders.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-8 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/teams")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="px-8 font-bold">
            {isPending ? "Saving..." : (initialData ? "Update Team" : "Create Team")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
