"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Award, Save, X } from "lucide-react";
import { createRiderStat, updateRiderStat } from "@/lib/actions/results.actions";

interface DriverForSelect {
  id: string;
  fullName: string;
  racingCategory: string | null;
  playerType: string | null;
  currentTeam: string | null;
}

interface RiderStatData {
  id?: string;
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
}

interface RiderStatFormProps {
  drivers: DriverForSelect[];
  initialData?: RiderStatData | null;
  defaultYear?: number;
  defaultCategory?: string;
}

const CATEGORIES = ["Formula 1", "MotoGP", "Sri Lanka Racing", "Rally", "Supercars", "Karting"];
const YEARS = [2026, 2025, 2024];

export function RiderStatForm({
  drivers,
  initialData,
  defaultYear = 2026,
  defaultCategory = "Formula 1",
}: RiderStatFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [driverId, setDriverId] = useState(initialData?.driverId || drivers[0]?.id || "");
  const [season, setSeason] = useState((initialData?.season || defaultYear).toString());
  const [category, setCategory] = useState(initialData?.category || defaultCategory);
  const [bike, setBike] = useState(initialData?.bike || "");
  const [starts, setStarts] = useState((initialData?.starts || 0).toString());
  const [poles, setPoles] = useState((initialData?.poles || 0).toString());
  const [firstPos, setFirstPos] = useState((initialData?.firstPos || 0).toString());
  const [secondPos, setSecondPos] = useState((initialData?.secondPos || 0).toString());
  const [thirdPos, setThirdPos] = useState((initialData?.thirdPos || 0).toString());
  const [podiums, setPodiums] = useState((initialData?.podiums || 0).toString());
  const [points, setPoints] = useState((initialData?.points || 0).toString());
  const [position, setPosition] = useState(initialData?.position || "1");
  const [fastestLaps, setFastestLaps] = useState((initialData?.fastestLaps || 0).toString());
  const [dnfs, setDnfs] = useState((initialData?.dnfs || 0).toString());

  // Auto-fill team color or team name when driver is selected
  useEffect(() => {
    if (driverId && !initialData) {
      const drv = drivers.find((d) => d.id === driverId);
      if (drv?.currentTeam) {
        setBike(drv.currentTeam);
      }
    }
  }, [driverId, drivers, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!driverId) {
      setError("Please select an athlete");
      return;
    }

    const payload = {
      driverId,
      season: parseInt(season) || 2026,
      category,
      bike: bike || undefined,
      starts: parseInt(starts) || 0,
      poles: parseInt(poles) || 0,
      firstPos: parseInt(firstPos) || 0,
      secondPos: parseInt(secondPos) || 0,
      thirdPos: parseInt(thirdPos) || 0,
      podiums: parseInt(podiums) || 0,
      points: parseInt(points) || 0,
      position,
      fastestLaps: parseInt(fastestLaps) || 0,
      dnfs: parseInt(dnfs) || 0,
    };

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateRiderStat(initialData.id, payload);
      } else {
        res = await createRiderStat(payload);
      }

      if (res.success) {
        router.push(`/admin/results?year=${season}&category=${encodeURIComponent(category)}`);
        router.refresh();
      } else {
        setError(res.error || "Failed to save standings stats.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in zoom-in-95">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Driver Selection */}
        <div className="space-y-2 sm:col-span-3">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Motorsport Athlete</label>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            disabled={isPending}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            required
          >
            <option value="" disabled>-- Select Athlete --</option>
            {drivers.map((drv) => (
              <option key={drv.id} value={drv.id}>
                {drv.fullName} ({drv.playerType || "driver"})
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Season / Year</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            disabled={isPending}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isPending}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Bike/Car */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Vehicle / Bike / Car</label>
          <Input
            placeholder="E.g., Lanka Racing Team, Ducati"
            value={bike}
            onChange={(e) => setBike(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Starts */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Starts</label>
          <Input
            type="number"
            value={starts}
            onChange={(e) => setStarts(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Poles */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Poles</label>
          <Input
            type="number"
            value={poles}
            onChange={(e) => setPoles(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Wins / 1st Pos */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Wins (1st places)</label>
          <Input
            type="number"
            value={firstPos}
            onChange={(e) => setFirstPos(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* 2nd places */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">2nd Places</label>
          <Input
            type="number"
            value={secondPos}
            onChange={(e) => setSecondPos(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* 3rd places */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">3rd Places</label>
          <Input
            type="number"
            value={thirdPos}
            onChange={(e) => setThirdPos(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Podiums */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Podiums</label>
          <Input
            type="number"
            value={podiums}
            onChange={(e) => setPodiums(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Fastest Laps */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Fastest Laps</label>
          <Input
            type="number"
            value={fastestLaps}
            onChange={(e) => setFastestLaps(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* DNFs */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">DNFs (Retirements)</label>
          <Input
            type="number"
            value={dnfs}
            onChange={(e) => setDnfs(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Points */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-primary font-semibold">Season Points</label>
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            disabled={isPending}
            className="border-primary/40 focus:ring-primary/30"
            required
          />
        </div>

        {/* Standings Position */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-primary font-semibold">Standings Rank (POS)</label>
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isPending}
            className="border-primary/40 focus:ring-primary/30"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => router.push(`/admin/results?year=${season}&category=${encodeURIComponent(category)}`)}
          disabled={isPending}
        >
          <X className="w-4 h-4" /> Cancel
        </Button>
        <Button type="submit" className="gap-2 shadow-md" disabled={isPending}>
          {isPending ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? "Saving..." : initialData ? "Save Changes" : "Save Standings"}
        </Button>
      </div>
    </form>
  );
}
