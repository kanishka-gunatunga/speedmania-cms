import { getAchievements, getRiderStats, getDriversForSelect } from "@/lib/actions/results.actions";
import { ResultsManager } from "@/components/admin/results-manager";

import { getCategories } from "@/lib/actions/category.actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    year?: string;
    category?: string;
    racePage?: string;
    standingPage?: string;
  }>;
}

export default async function ResultsAdminPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const year = parseInt(resolvedParams.year || "2026");
  const racePage = parseInt(resolvedParams.racePage || "1");
  const standingPage = parseInt(resolvedParams.standingPage || "1");
  const limit = 10;

  // Fetch all initial data sequentially to prevent connection pool exhaustion
  const achievementsData = await getAchievements({ year, category: resolvedParams.category }, racePage, limit);
  const statsData = await getRiderStats({ season: year, category: resolvedParams.category }, standingPage, limit);
  const drivers = await getDriversForSelect();
  const standingCategories = await getCategories("standing");

  // Set default category to the first available category if none is provided
  const category = resolvedParams.category || (standingCategories.length > 0 ? standingCategories[0].name : "Formula 1");

  return (
    <ResultsManager
      initialAchievements={achievementsData.achievements as any}
      totalAchievements={achievementsData.total}
      racePage={racePage}
      initialRiderStats={statsData.riderStats as any}
      totalRiderStats={statsData.total}
      standingPage={standingPage}
      limit={limit}
      drivers={drivers}
      standingCategories={standingCategories as any}
      currentYear={year}
      currentCategory={category}
    />
  );
}
