import { getAchievements, getRiderStats, getDriversForSelect } from "@/lib/actions/results.actions";
import { ResultsManager } from "@/components/admin/results-manager";

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
  const category = resolvedParams.category || "Formula 1";

  // Fetch all initial data concurrently in parallel
  const [achievements, stats, drivers] = await Promise.all([
    getAchievements({ year, category }),
    getRiderStats({ season: year, category }),
    getDriversForSelect(),
  ]);

  return (
    <ResultsManager
      initialAchievements={achievements}
      initialRiderStats={stats}
      drivers={drivers}
      currentYear={year}
      currentCategory={category}
    />
  );
}
