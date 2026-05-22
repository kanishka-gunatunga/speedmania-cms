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
import { BlogEditor } from "@/components/blogs/blog-editor";

const achievementSchema = z.object({
  raceName: z.string().min(1, "Race name is required"),
  year: z.coerce.number().min(0, "Year cannot be negative").optional(),
  date: z.string().optional(),
  team: z.string().optional(),
  position: z.string().optional(),
  points: z.coerce.number().min(0, "Points cannot be negative").optional(),
  category: z.string().optional(),
});

const statsSchema = z.object({
  season: z.coerce.number().min(0, "Season cannot be negative").optional(),
  category: z.string().optional(),
  bike: z.string().optional(),
  starts: z.coerce.number().min(0, "Starts cannot be negative").optional(),
  poles: z.coerce.number().min(0, "Poles cannot be negative").optional(),
  firstPos: z.coerce.number().min(0, "Wins cannot be negative").optional(),
  secondPos: z.coerce.number().min(0, "Second places cannot be negative").optional(),
  thirdPos: z.coerce.number().min(0, "Third places cannot be negative").optional(),
  podiums: z.coerce.number().min(0, "Podiums cannot be negative").optional(),
  points: z.coerce.number().min(0, "Points cannot be negative").optional(),
  position: z.string().optional(),
  fastestLaps: z.coerce.number().min(0, "Fastest laps cannot be negative").optional(),
  dnfs: z.coerce.number().min(0, "DNFs cannot be negative").optional(),
  sprintRaces: z.coerce.number().min(0, "Sprint races cannot be negative").optional(),
  sprintPoints: z.coerce.number().min(0, "Sprint points cannot be negative").optional(),
  sprintWins: z.coerce.number().min(0, "Sprint wins cannot be negative").optional(),
  sprintPodiums: z.coerce.number().min(0, "Sprint podiums cannot be negative").optional(),
  sprintPoles: z.coerce.number().min(0, "Sprint poles cannot be negative").optional(),
});

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dob: z.string().optional(),
  otherName: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  racingCategory: z.string().optional(),
  yearsActive: z.coerce.number().min(0, "Years active cannot be negative").optional(),
  totalRaces: z.coerce.number().min(0, "Total races cannot be negative").optional(),
  totalWins: z.coerce.number().min(0, "Total wins cannot be negative").optional(),
  totalPodiums: z.coerce.number().min(0, "Total podiums cannot be negative").optional(),
  bestCareerFinish: z.string().optional(),
  championshipsWon: z.string().optional(),
  currentTeam: z.string().optional(),
  previousTeams: z.string().optional(),
  sponsorDetails: z.string().optional(),
  
  // F1 Specific
  teamColor: z.string().optional(),
  accessibleColor: z.string().optional(),
  number: z.string().optional(),
  image: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  numberImage: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  flagCode: z.string().optional(),
  country: z.string().optional(),

  vehicleModel: z.string().optional(),
  engineCapacity: z.string().optional(),
  vehicleClass: z.string().optional(),
  chassisNumber: z.string().optional(),
  liveryScheme: z.string().optional(),
  achievements: z.array(achievementSchema).default([]),
  riderStats: z.array(statsSchema).default([]),
  playerType: z.string().default("driver"),
  careerPoints: z.string().refine(val => !val || parseFloat(val) >= 0, "Career points cannot be negative").optional(),
  careerPoles: z.coerce.number().min(0, "Career poles cannot be negative").optional(),
  biography: z.string().optional(),
});

interface DriverFormValues {
  fullName: string;
  firstName?: string;
  lastName?: string;
  slug: string;
  dob?: string;
  otherName?: string;
  playerType?: string;
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
  teamColor?: string;
  accessibleColor?: string;
  number?: string;
  image?: string;
  numberImage?: string;
  flagCode?: string;
  country?: string;
  vehicleModel?: string;
  engineCapacity?: string;
  vehicleClass?: string;
  chassisNumber?: string;
  liveryScheme?: string;
  careerPoints?: string;
  careerPoles?: number;
  biography?: string;
  achievements: {
    raceName: string;
    year?: number;
    date?: string;
    team?: string;
    position?: string;
    points?: number;
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
    fastestLaps?: number;
    dnfs?: number;
    sprintRaces?: number;
    sprintPoints?: number;
    sprintWins?: number;
    sprintPodiums?: number;
    sprintPoles?: number;
  }[];
}

interface DriverFormProps {
  initialData?: any;
  isPublic?: boolean;
}

export function DriverForm({ initialData, isPublic = false }: DriverFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      fullName: initialData?.fullName || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
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
      teamColor: initialData?.teamColor || "",
      accessibleColor: initialData?.accessibleColor || "",
      number: initialData?.number || "",
      image: initialData?.image || "",
      numberImage: initialData?.numberImage || "",
      flagCode: initialData?.flagCode || "",
      country: initialData?.country || "",
      vehicleModel: initialData?.vehicleModel || "",
      engineCapacity: initialData?.engineCapacity || "",
      vehicleClass: initialData?.vehicleClass || "",
      chassisNumber: initialData?.chassisNumber || "",
      liveryScheme: initialData?.liveryScheme || "",
      achievements: initialData?.achievements || [],
      riderStats: initialData?.riderStats || [],
      playerType: initialData?.playerType || "driver",
      careerPoints: initialData?.careerPoints || "",
      careerPoles: initialData?.careerPoles || 0,
      biography: initialData?.biography || "",
    },
  });

  const countryValue = form.watch("country") || "";
  const flagCodeValue = form.watch("flagCode") || "";
  const isSriLankan = countryValue.toLowerCase().trim() === "sri lanka" || countryValue.toLowerCase().trim() === "srilanka" || flagCodeValue.toLowerCase().trim() === "lk" || flagCodeValue.toLowerCase().trim() === "sl";

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control: form.control,
    name: "achievements",
  });

  const { fields: statsFields, append: appendStat, remove: removeStat } = useFieldArray({
    control: form.control,
    name: "riderStats",
  });

  function onSubmit(data: DriverFormValues) {
    console.log("Form submitted with data:", data);
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
          if (isPublic) {
            router.push("/submit-profile/success");
          } else {
            router.push("/admin/drivers");
          }
          router.refresh();
        } else {
          setError(result.error || "Something went wrong");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      }
    });
  }

  // Debug: Log form errors
  if (Object.keys(form.formState.errors).length > 0) {
    console.log("Form validation errors:", form.formState.errors);
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
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-8 h-auto gap-2 bg-transparent p-0">
            {["personal", "f1-branding", "motorsport", "team", "vehicle", "achievements", "stats"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border py-2 px-4 capitalize"
              >
                {tab === "f1-branding" ? "F1 Branding" : tab}
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Full Name (Display)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Lewis Hamilton" {...field} onChange={(e) => {
                          field.onChange(e);
                          if (!initialData && form.getValues("slug") === "") {
                            form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                          }
                          // Auto-split name if possible
                          const parts = e.target.value.trim().split(/\s+/);
                          if (parts.length >= 2) {
                            form.setValue("firstName", parts[0]);
                            form.setValue("lastName", parts.slice(1).join(" "));
                          }
                        }}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Lewis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Hamilton" {...field} />
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
                  name="playerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Athlete Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="driver">Driver (Formula 1)</option>
                          <option value="rider">Rider (Motorcycle)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Quote / Alias (Display on Profile)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. If in doubt, go flat out" {...field} />
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
                      <FormLabel>Biography</FormLabel>
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

          {/* F1 BRANDING */}
          <TabsContent value="f1-branding" className="space-y-6">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="teamColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Primary Color (Hex)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2 items-center">
                           <Input placeholder="#E8002D" {...field} className="flex-grow font-mono" />
                           <div className="relative w-10 h-10 rounded-md border border-input shadow-sm overflow-hidden flex items-center justify-center bg-muted hover:bg-accent transition-colors">
                             <input 
                               type="color" 
                               value={field.value && /^#[0-9A-Fa-f]{6}$/.test(field.value) ? field.value : "#000000"} 
                               onChange={(e) => field.onChange(e.target.value)}
                               className="absolute inset-0 w-full h-full cursor-pointer opacity-0" 
                             />
                             <div className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: field.value || "#000000" }} />
                           </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accessibleColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Dark Color (Accessible)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2 items-center">
                           <Input placeholder="#5C0012" {...field} className="flex-grow font-mono" />
                           <div className="relative w-10 h-10 rounded-md border border-input shadow-sm overflow-hidden flex items-center justify-center bg-muted hover:bg-accent transition-colors">
                             <input 
                               type="color" 
                               value={field.value && /^#[0-9A-Fa-f]{6}$/.test(field.value) ? field.value : "#000000"} 
                               onChange={(e) => field.onChange(e.target.value)}
                               className="absolute inset-0 w-full h-full cursor-pointer opacity-0" 
                             />
                             <div className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: field.value || "#000000" }} />
                           </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Number</FormLabel>
                      <FormControl>
                        <Input placeholder="44" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flagCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Flag Code (ISO 2-letter)</FormLabel>
                      <FormControl>
                        <Input placeholder="GB / IT / MC" {...field} />
                      </FormControl>
                      <FormDescription>Used for flag icons (e.g. GB for Great Britain)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Great Britain" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Driver Portrait URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://media.formula1.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Driver Number Mask URL (Transparent SVG/PNG)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://media.formula1.com/..." {...field} />
                      </FormControl>
                      <FormDescription>Used for the large background number branding</FormDescription>
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
                        <Input type="number" min={0} {...field} />
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
                      <FormLabel>{isSriLankan ? "Race Entered" : "Grand Prix Entered"}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isSriLankan ? (
                  <FormField
                    control={form.control}
                    name="totalWins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race Wins</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="careerPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Career Points</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" min={0} {...field} placeholder="E.g. 5069.5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="bestCareerFinish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Highest Race Finish</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. 1 (x105) or 1st in SLGT 2023" {...field} />
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
                      <FormLabel>Podiums</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="careerPoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pole Positions</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
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
                      <FormLabel>{isSriLankan ? "Championships" : "World Championships"}</FormLabel>
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
                onClick={() => appendAchievement({ raceName: "", year: new Date().getFullYear(), position: "", category: "Formula 1", date: "", team: "", points: 0 })}
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
                            <Input type="number" min={0} {...field} />
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
                    <FormField
                      control={form.control}
                      name={`achievements.${index}.date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground">Date (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="08 Mar" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`achievements.${index}.team`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground">Team (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Mercedes" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`achievements.${index}.points`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground">Points (Optional)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
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
                  category: "Formula 1",
                  bike: "Mercedes W17",
                  starts: 0,
                  poles: 0,
                  firstPos: 0,
                  secondPos: 0,
                  thirdPos: 0,
                  podiums: 0,
                  points: 0,
                  position: "-",
                  fastestLaps: 0,
                  dnfs: 0,
                  sprintRaces: 0,
                  sprintPoints: 0,
                  sprintWins: 0,
                  sprintPodiums: 0,
                  sprintPoles: 0
                })}
              >
                <Plus className="w-4 h-4" />
                Add Season
              </Button>
            </div>
            <div className="space-y-4">
              {statsFields.map((field, index) => (
                <Card key={field.id} className="relative group overflow-hidden">
                  <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-4 pr-12">
                    <FormField control={form.control} name={`riderStats.${index}.season`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Season</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.category`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Category</FormLabel><FormControl><Input className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.bike`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Vehicle</FormLabel><FormControl><Input className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.starts`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Starts</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.poles`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Poles</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.firstPos`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">1st</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.secondPos`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">2nd</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.thirdPos`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">3rd</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.podiums`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Podiums</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.points`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Points</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.position`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Pos</FormLabel><FormControl><Input className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.fastestLaps`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Fastest Laps</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.dnfs`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">DNFs</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.sprintRaces`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Sprint Races</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.sprintPoints`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Sprint Pts</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.sprintWins`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Sprint Wins</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.sprintPodiums`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Sprint Podiums</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name={`riderStats.${index}.sprintPoles`} render={({field}) => (
                      <FormItem><FormLabel className="text-[10px] uppercase">Sprint Poles</FormLabel><FormControl><Input type="number" min={0} className="h-8 text-xs" {...field} /></FormControl></FormItem>
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
          {!isPublic && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/drivers")}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending} className="px-8">
            {isPending ? "Saving..." : isPublic ? "Submit Profile for Review" : (initialData ? "Update Profile" : "Create Profile")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
