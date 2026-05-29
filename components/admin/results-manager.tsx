"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Filter, 
  Sparkles,
  MapPin,
  Car,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { deleteAchievement, deleteRiderStat } from "@/lib/actions/results.actions";

const CATEGORIES = ["Formula 1", "MotoGP", "Sri Lanka Racing", "Rally", "Supercars", "Karting"];
const YEARS = [2026, 2025, 2024];

interface DriverForSelect {
  id: string;
  fullName: string;
  racingCategory: string | null;
  playerType: string | null;
  currentTeam: string | null;
  flagCode: string | null;
  country: string | null;
}

interface AchievementRow {
  id: string;
  driverId: string;
  raceName: string;
  year: number | null;
  date: string | null;
  team: string | null;
  position: string | null;
  points: number | null;
  category: string | null;
  driverName: string | null;
  driverSlug: string | null;
}

interface RiderStatRow {
  id: string;
  driverId: string;
  season: number | null;
  category: string | null;
  bike: string | null;
  starts: number | null;
  poles: number | null;
  firstPos: number | null;
  secondPos: number | null;
  thirdPos: number | null;
  podiums: number | null;
  points: number | null;
  position: string | null;
  fastestLaps: number | null;
  dnfs: number | null;
  driverName: string | null;
  driverSlug: string | null;
}

interface ResultsManagerProps {
  initialAchievements: AchievementRow[];
  initialRiderStats: RiderStatRow[];
  drivers: DriverForSelect[];
  currentYear: number;
  currentCategory: string;
}

export function ResultsManager({
  initialAchievements,
  initialRiderStats,
  drivers,
  currentYear,
  currentCategory,
}: ResultsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory);
  const [regionFilter, setRegionFilter] = useState<"all" | "sl">("all");

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("races");

  // ── Trigger Server-side Re-fetching when filters change ──
  const handleFilterChange = (year: number, cat: string) => {
    setSelectedYear(year);
    setSelectedCategory(cat);
    router.push(`/admin/results?year=${year}&category=${encodeURIComponent(cat)}`);
  };

  // ── Filter by Region (SL vs All) on the Client side for visual flexibility ──
  const isSriLankanDriver = (driverId: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    if (!drv) return false;
    return (
      (drv.flagCode || "").toUpperCase() === "LK" ||
      (drv.country || "").toLowerCase().includes("sri lanka")
    );
  };

  const filteredAchievements = initialAchievements.filter((ach) => {
    if (regionFilter === "sl") {
      return isSriLankanDriver(ach.driverId);
    }
    return true;
  });

  const filteredRiderStats = initialRiderStats.filter((stat) => {
    if (regionFilter === "sl") {
      return isSriLankanDriver(stat.driverId);
    }
    return true;
  });

  // ── Handle Achievement Delete ──
  const handleDeleteAchievement = (id: string) => {
    if (!confirm("Are you sure you want to delete this race result?")) return;

    startTransition(async () => {
      const res = await deleteAchievement(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to delete");
      }
    });
  };

  // ── Handle Rider Stat Delete ──
  const handleDeleteRiderStat = (id: string) => {
    if (!confirm("Are you sure you want to delete these standing stats?")) return;

    startTransition(async () => {
      const res = await deleteRiderStat(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to delete");
      }
    });
  };

  // Compute total points in standings or stats for widgets
  const totalRacesRun = new Set(initialAchievements.map(a => a.raceName)).size;
  const totalRankedAthletes = initialRiderStats.length;
  const topAthlete = initialRiderStats[0] ? `${initialRiderStats[0].driverName} (${initialRiderStats[0].points} pts)` : "None";

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-primary font-black uppercase tracking-widest font-orbitron mb-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Live CMS System
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500 shrink-0" />
            Results & Standings
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage live championship statistics, podium records, and race results.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border/50 shadow-sm backdrop-blur-md">
          {/* Year */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedYear}
              onChange={(e) => handleFilterChange(parseInt(e.target.value), selectedCategory)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y} Season
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(selectedYear, e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all max-w-[160px] md:max-w-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Region Toggle */}
          <div className="flex items-center gap-0 border border-border rounded-xl overflow-hidden bg-background">
            <button
              onClick={() => setRegionFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                regionFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌍 All Intl
            </button>
            <button
              onClick={() => setRegionFilter("sl")}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                regionFilter === "sl"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇱🇰 SL Only
            </button>
          </div>
        </div>
      </div>

      {/* ── Key Standings Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Races Tracked</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600">
              <MapPin className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-orbitron">{totalRacesRun}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique Grand Prix routes in {selectedYear}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Athletes Ranked</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-orbitron">{totalRankedAthletes}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered profiles with season stats</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Championship Leader</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate mt-1 text-yellow-600 font-orbitron">{topAthlete}</div>
            <p className="text-xs text-muted-foreground mt-1.5">Highest points scorer in {selectedYear}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Tabbed Content Panel ── */}
      <Tabs defaultValue="races" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-6">
          <TabsList variant="line" className="h-9">
            <TabsTrigger value="races" className="gap-2 cursor-pointer font-semibold py-1">
              <Car className="w-4 h-4" />
              Race Results ({filteredAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-2 cursor-pointer font-semibold py-1">
              <Award className="w-4 h-4" />
              Driver Season Standings ({filteredRiderStats.length})
            </TabsTrigger>
          </TabsList>

          <div>
            {activeTab === "races" ? (
              <Link href={`/admin/results/achievements/new?year=${selectedYear}&category=${encodeURIComponent(selectedCategory)}`}>
                <Button className="gap-2 rounded-xl shadow-md cursor-pointer hover:-translate-y-0.5 transition-all duration-300">
                  <Plus className="w-4 h-4" /> Add Race Result
                </Button>
              </Link>
            ) : (
              <Link href={`/admin/results/standings/new?year=${selectedYear}&category=${encodeURIComponent(selectedCategory)}`}>
                <Button className="gap-2 rounded-xl shadow-md cursor-pointer hover:-translate-y-0.5 transition-all duration-300">
                  <Plus className="w-4 h-4" /> Add Driver Standings
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── TAB CONTENT: RACE RESULTS (ACHIEVEMENTS) ── */}
        <TabsContent value="races" className="outline-none focus:outline-none">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Race-by-Race Achievements
              </CardTitle>
              <CardDescription>
                Records representing race winners and finishers for {selectedYear} {selectedCategory}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending && (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!isPending && (
                <div className="rounded-xl border border-border/60 overflow-hidden bg-background/50">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground w-[220px]">Race Name</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground w-[100px]">Date</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground">Driver</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground">Team / Car</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-center w-[80px]">POS</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-right w-[90px]">PTS</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-right w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAchievements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2 justify-center py-6">
                              <Trophy className="w-8 h-8 opacity-20 text-muted-foreground" />
                              <p className="font-semibold">No race achievements found.</p>
                              <p className="text-xs">Select a different year, category, or add a new record to begin.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAchievements.map((ach) => {
                          const isSL = isSriLankanDriver(ach.driverId);
                          return (
                            <TableRow key={ach.id} className="hover:bg-muted/10 group transition-colors">
                              <TableCell className="font-bold text-foreground/90">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-4 rounded-full bg-primary" />
                                  {ach.raceName}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-muted-foreground">{ach.date || "—"}</TableCell>
                              <TableCell className="font-semibold">
                                <div className="flex items-center gap-2">
                                  {ach.driverName || "Unknown Athlete"}
                                  {isSL && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 uppercase font-orbitron">
                                      🇱🇰 SL
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-muted-foreground/80">{ach.team || "—"}</TableCell>
                              <TableCell className="text-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-black uppercase font-orbitron ${
                                  ach.position === "1"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200"
                                    : ach.position === "2"
                                    ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                                    : ach.position === "3"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  P{ach.position}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-black font-orbitron text-base text-foreground/95">{ach.points ?? 0}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Link href={`/admin/results/achievements/${ach.id}`}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteAchievement(ach.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB CONTENT: DRIVER SEASON STANDINGS (RIDER STATS) ── */}
        <TabsContent value="drivers" className="outline-none focus:outline-none">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Driver Season Leaderboards
              </CardTitle>
              <CardDescription>
                Aggregated statistics that determine the overall Drivers' and Riders' Standings leaderboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending && (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!isPending && (
                <div className="rounded-xl border border-border/60 overflow-hidden bg-background/50">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground w-[70px]">Rank</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground">Driver</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground">Vehicle / Bike</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-center">Starts</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-center">Poles</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-center">Wins</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-center">Podiums</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-right">Points</TableHead>
                        <TableHead className="font-semibold text-xs uppercase text-muted-foreground text-right w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRiderStats.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-28 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2 justify-center py-6">
                              <Award className="w-8 h-8 opacity-20 text-muted-foreground" />
                              <p className="font-semibold">No driver season stats found.</p>
                              <p className="text-xs">Select a different season, category, or add a standing record to begin.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRiderStats.map((stat, idx) => {
                          const isSL = isSriLankanDriver(stat.driverId);
                          const rank = stat.position || (idx + 1).toString();
                          return (
                            <TableRow key={stat.id} className="hover:bg-muted/10 group transition-colors">
                              <TableCell className="font-black font-orbitron text-center text-sm text-foreground/75">
                                #{rank}
                              </TableCell>
                              <TableCell className="font-semibold">
                                <div className="flex items-center gap-2">
                                  {stat.driverName || "Unknown Athlete"}
                                  {isSL && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 uppercase font-orbitron">
                                      🇱🇰 SL
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-muted-foreground">{stat.bike || "—"}</TableCell>
                              <TableCell className="text-center font-bold font-orbitron text-muted-foreground/90">{stat.starts ?? 0}</TableCell>
                              <TableCell className="text-center font-bold font-orbitron text-muted-foreground/90">{stat.poles ?? 0}</TableCell>
                              <TableCell className="text-center font-bold font-orbitron text-green-600 dark:text-green-400">{stat.firstPos ?? 0}</TableCell>
                              <TableCell className="text-center font-bold font-orbitron text-blue-600 dark:text-blue-400">{stat.podiums ?? 0}</TableCell>
                              <TableCell className="text-right font-black font-orbitron text-base text-foreground/95">{stat.points ?? 0}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Link href={`/admin/results/standings/${stat.id}`}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteRiderStat(stat.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
