"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Car, Save, X } from "lucide-react";
import { createAchievement, updateAchievement } from "@/lib/actions/results.actions";

interface DriverForSelect {
  id: string;
  fullName: string;
  racingCategory: string | null;
  playerType: string | null;
  currentTeam: string | null;
}

interface AchievementData {
  id?: string;
  driverId: string;
  raceName: string;
  year: number | null;
  date: string | null;
  team: string | null;
  position: string | null;
  points: number | null;
  category: string | null;
}

interface AchievementFormProps {
  drivers: DriverForSelect[];
  initialData?: AchievementData | null;
  defaultYear?: number;
  defaultCategory?: string;
  standingCategories: any[];
}

const YEARS = [2026, 2025, 2024];

export function AchievementForm({
  drivers,
  initialData,
  defaultYear = 2026,
  defaultCategory = "Formula 1",
  standingCategories = [],
}: AchievementFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [driverId, setDriverId] = useState(initialData?.driverId || drivers[0]?.id || "");
  const [raceName, setRaceName] = useState(initialData?.raceName || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [team, setTeam] = useState(initialData?.team || "");
  const [position, setPosition] = useState(initialData?.position || "1");
  const [points, setPoints] = useState((initialData?.points || 0).toString());
  const [year, setYear] = useState((initialData?.year || defaultYear).toString());
  const [category, setCategory] = useState(initialData?.category || defaultCategory);

  // Auto-fill team when driver is selected and team is empty
  useEffect(() => {
    if (driverId && !initialData) {
      const drv = drivers.find((d) => d.id === driverId);
      if (drv?.currentTeam) {
        setTeam(drv.currentTeam);
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
    if (!raceName.trim()) {
      setError("Race Name / GP is required");
      return;
    }
    if (!position.trim()) {
      setError("Finish position is required");
      return;
    }

    const payload = {
      driverId,
      raceName,
      year: parseInt(year) || 2026,
      date: date || undefined,
      team: team || undefined,
      position,
      points: parseInt(points) || 0,
      category,
    };

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateAchievement(initialData.id, payload);
      } else {
        res = await createAchievement(payload);
      }

      if (res.success) {
        router.push(`/admin/results?year=${year}&category=${encodeURIComponent(category)}`);
        router.refresh();
      } else {
        setError(res.error || "Failed to save race result.");
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver / Rider Selection */}
        <div className="space-y-2 md:col-span-2">
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

        {/* Race Name */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Race Name / Grand Prix</label>
          <Input
            placeholder="E.g., Katukurunda GP, Australian Grand Prix"
            value={raceName}
            onChange={(e) => setRaceName(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Race Date (e.g. 12 Feb)</label>
          <Input
            placeholder="E.g., 12 Feb, 26 Mar"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Team */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Team / Manufacturer</label>
          <Input
            placeholder="E.g., Lanka Racing Team, Ferrari"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Position */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Finish Position</label>
          <Input
            placeholder="E.g., 1, 2, DNF, DSQ"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        {/* Points */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Points Awarded</label>
          <Input
            type="number"
            placeholder="E.g., 25"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        {/* Year */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Year / Season</label>
          <Input
            type="number"
            placeholder="E.g., 2026"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={isPending}
            required
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category / Racing Type</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isPending}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
          >
            {standingCategories
              .filter((c) => !c.parentId)
              .map((mainCat) => {
                const subs = standingCategories.filter((sub) => sub.parentId === mainCat.id);
                if (subs.length === 0) {
                  return (
                    <option key={mainCat.id} value={mainCat.name}>
                      {mainCat.name}
                    </option>
                  );
                }
                return (
                  <optgroup key={mainCat.id} label={mainCat.name}>
                    {subs.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            {/* Fallback for categories without a parent if any */}
            {standingCategories
              .filter(
                (c) =>
                  c.parentId &&
                  !standingCategories.some((m) => !m.parentId && m.id === c.parentId)
              )
              .map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => router.push(`/admin/results?year=${year}&category=${encodeURIComponent(category)}`)}
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
          {isPending ? "Saving..." : initialData ? "Save Changes" : "Save Result"}
        </Button>
      </div>
    </form>
  );
}
