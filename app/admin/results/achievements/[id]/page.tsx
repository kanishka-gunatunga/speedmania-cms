import { getDriversForSelect, getAchievementById } from "@/lib/actions/results.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { AchievementForm } from "@/components/admin/achievement-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAchievementPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch achievement details and approved drivers in parallel
  const [achievement, drivers, standingCategories] = await Promise.all([
    getAchievementById(id),
    getDriversForSelect(),
    getCategories("standing"),
  ]);

  if (!achievement) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/admin/results?year=${achievement.year || 2026}&category=${encodeURIComponent(achievement.category || "Formula 1")}`}>
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Results
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-extrabold flex items-center gap-2">
            {/*<Trophy className="w-8 h-8 text-yellow-500 shrink-0" />*/}
            Edit Race Result
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Modify the Grand Prix achievement record for {achievement.raceName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AchievementForm
            drivers={drivers}
            standingCategories={standingCategories as any}
            initialData={achievement}
          />
        </CardContent>
      </Card>
    </div>
  );
}
