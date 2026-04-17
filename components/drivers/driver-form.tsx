"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { createDriver, updateDriver } from "@/lib/actions/driver.actions";

const achievementSchema = z.object({
  raceName: z.string().min(1, "Race name is required"),
  year: z.coerce.number().optional(),
  position: z.string().optional(),
  category: z.string().optional(),
});

const statsSchema = z.object({
  season: z.coerce.number().optional(),
  category: z.string().optional(),
  bike: z.string().optional(),
  starts: z.coerce.number().optional(),
  poles: z.coerce.number().optional(),
  firstPos: z.coerce.number().optional(),
  secondPos: z.coerce.number().optional(),
  thirdPos: z.coerce.number().optional(),
  podiums: z.coerce.number().optional(),
  points: z.coerce.number().optional(),
  position: z.string().optional(),
});

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  dob: z.string().optional(),
  otherName: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  racingCategory: z.string().optional(),
  yearsActive: z.coerce.number().optional(),
  totalRaces: z.coerce.number().optional(),
  totalWins: z.coerce.number().optional(),
  totalPodiums: z.coerce.number().optional(),
  bestCareerFinish: z.string().optional(),
  championshipsWon: z.string().optional(),
  currentTeam: z.string().optional(),
  previousTeams: z.string().optional(),
  sponsorDetails: z.string().optional(),
  vehicleModel: z.string().optional(),
  engineCapacity: z.string().optional(),
  vehicleClass: z.string().optional(),
  chassisNumber: z.string().optional(),
  liveryScheme: z.string().optional(),
  achievements: z.array(achievementSchema).default([]),
  riderStats: z.array(statsSchema).default([]),
});

interface DriverFormValues {
  fullName: string;
  slug: string;
  dob?: string;
  otherName?: string;
  racingCategory?: string;
  yearsActive?: number;
  totalRaces?: number;
  totalWins?: number;
  totalPodiums?: number;
  bestCareerFinish?: string;
  championshipsWon?: string;
  currentTeam?: string;
  previousTeams?: string;
  sponsorDetails?: string;
  vehicleModel?: string;
  engineCapacity?: string;
  vehicleClass?: string;
  chassisNumber?: string;
  liveryScheme?: string;
  achievements: {
    raceName: string;
    year?: number;
    position?: string;
    category?: string;
  }[];
  riderStats: {
    season?: number;
    category?: string;
    bike?: string;
    starts?: number;
    poles?: number;
    firstPos?: number;
    secondPos?: number;
    thirdPos?: number;
    podiums?: number;
    points?: number;
    position?: string;
  }[];
}

interface DriverFormProps {
  initialData?: any;
}

export function DriverForm({ initialData }: DriverFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      fullName: initialData?.fullName || "",
      dob: initialData?.dob || "",
      otherName: initialData?.otherName || "",
      slug: initialData?.slug || "",
      racingCategory: initialData?.racingCategory || "",
      yearsActive: initialData?.yearsActive || 0,
      totalRaces: initialData?.totalRaces || 0,
      totalWins: initialData?.totalWins || 0,
      totalPodiums: initialData?.totalPodiums || 0,
      bestCareerFinish: initialData?.bestCareerFinish || "",
      championshipsWon: initialData?.championshipsWon || "",
      currentTeam: initialData?.currentTeam || "",
      previousTeams: initialData?.previousTeams || "",
      sponsorDetails: initialData?.sponsorDetails || "",
      vehicleModel: initialData?.vehicleModel || "",
      engineCapacity: initialData?.engineCapacity || "",
      vehicleClass: initialData?.vehicleClass || "",
      chassisNumber: initialData?.chassisNumber || "",
      liveryScheme: initialData?.liveryScheme || "",
      achievements: initialData?.achievements || [],
      riderStats: initialData?.riderStats || [],
    },
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control: form.control,
    name: "achievements",
  });

  const { fields: statsFields, append: appendStat, remove: removeStat } = useFieldArray({
    control: form.control,
    name: "riderStats",
  });

  function onSubmit(data: DriverFormValues) {
    setError(null);
    startTransition(async () => {
      try {
        let result;
        if (initialData?.id) {
          result = await updateDriver(initialData.id, data);
        } else {
          result = await createDriver(data);
        }

        if (result.success) {
          router.push("/admin/drivers");
          router.refresh();
        } else {
          setError(result.error || "Something went wrong");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-3 text-sm font-medium bg-destructive/15 text-destructive rounded-md">
            {error}
          </div>
        )}

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 h-auto gap-2 bg-transparent p-0">
            {["personal", "motorsport", "team", "vehicle", "achievements", "stats"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border py-2 px-4 capitalize"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* PERSONAL DETAILS */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Lewis Hamilton" {...field} onChange={(e) => {
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
                        <Input placeholder="lewis-hamilton" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input placeholder="DD/MM/YYYY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Name / Alias</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Billion Dollar Man" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* MOTORSPORT BACKGROUND */}
          <TabsContent value="motorsport" className="space-y-6">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="racingCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Racing Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Circuit / Karting / Supercross" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years Active</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalRaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Races</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalWins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Wins</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalPodiums"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Podiums</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bestCareerFinish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Best Career Finish</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. 1st in SLGT 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="championshipsWon"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Championships / Titles Won</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List titles won..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEAM INFO */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="currentTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Team Mercedes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousTeams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Teams</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Team McLaren, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sponsorDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor Details</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Petronas, Monster Energy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* VEHICLE INFO */}
          <TabsContent value="vehicle" className="space-y-6">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car / Bike Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Mercedes W14" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Capacity (cc)</FormLabel>
                      <FormControl>
                        <Input placeholder="1600cc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Class / Group</FormLabel>
                      <FormControl>
                        <Input placeholder="SLGT / Formula 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chassisNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassis Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="CH-123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="liveryScheme"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Livery / Vehicle Color Scheme</FormLabel>
                      <FormControl>
                        <Input placeholder="Silver and Teal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACHIEVEMENTS */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notable Achievements</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => appendAchievement({ raceName: "", year: new Date().getFullYear(), position: "", category: "" })}
              >
                <Plus className="w-4 h-4" />
                Add Row
              </Button>
            </div>
            <div className="space-y-4">
              {achievementFields.map((field, index) => (
                <Card key={field.id} className="relative group overflow-hidden">
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pr-12">
                    <FormField
                      control={form.control}
                      name={`achievements.${index}.raceName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground">Race Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Fox Hill Supercross" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`achievements.${index}.year`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground">Year</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`achievements.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground">Position</FormLabel>
                          <FormControl>
                            <Input placeholder="1st Place" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`achievements.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground">Category</FormLabel>
                          <FormControl>
                            <Input placeholder="SLGT" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive hover:bg-destructive/10"
                      onClick={() => removeAchievement(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {achievementFields.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
                  No achievements added yet.
                </div>
              )}
            </div>
          </TabsContent>

          {/* STATS */}
          <TabsContent value="stats" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Rider Stats</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => appendStat({
                  season: new Date().getFullYear(),
                  category: "",
                  bike: "",
                  starts: 0,
                  poles: 0,
                  firstPos: 0,
                  secondPos: 0,
                  thirdPos: 0,
                  podiums: 0,
                  points: 0,
                  position: "-"
                })}
              >
                <Plus className="w-4 h-4" />
                Add Season
              </Button>
            </div>
            <div className="space-y-4">
              {statsFields.map((field, index) => (
                <Card key={field.id} className="relative group overflow-hidden">
                  <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-6 lg:grid-cols-11 gap-4 pr-12">
                    <FormField control={form.control} name={`riderStats.${index}.season`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Season</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.category`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Category</FormLabel><FormControl><Input className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.bike`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Vehicle</FormLabel><FormControl><Input className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.starts`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Starts</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.poles`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Poles</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.firstPos`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">1st</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.secondPos`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">2nd</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.thirdPos`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">3rd</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.podiums`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Podiums</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.points`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Points</FormLabel><FormControl><Input type="number" className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.position`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Pos</FormLabel><FormControl><Input className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-destructive h-7 w-7"
                      onClick={() => removeStat(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
               {statsFields.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground bg-muted/20">
                  No stats records added yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-8 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/drivers")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="px-8">
            {isPending ? "Saving..." : (initialData ? "Update Profile" : "Create Profile")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
