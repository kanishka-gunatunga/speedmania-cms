import { getAchievements, getRiderStats, getDriversForSelect } from "@/lib/actions/results.actions";
import { ResultsManager } from "@/components/admin/results-manager";

import { getCategories } from "@/lib/actions/category.actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    year?: string;
    category?: string;
  }>;
}

export default async function ResultsAdminPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const year = parseInt(resolvedParams.year || "2026");

  // Fetch all initial data concurrently in parallel
  const [achievements, stats, drivers, standingCategories] = await Promise.all([
    getAchievements({ year, category: resolvedParams.category }),
    getRiderStats({ season: year, category: resolvedParams.category }),
    getDriversForSelect(),
    getCategories("standing"),
  ]);

  // Set default category to the first available category if none is provided
  const category = resolvedParams.category || (standingCategories.length > 0 ? standingCategories[0].name : "Formula 1");

  return (
    <ResultsManager
      initialAchievements={achievements}
      initialRiderStats={stats}
      drivers={drivers}
      standingCategories={standingCategories as any}
      currentYear={year}
      currentCategory={category}
    />
  );
}
