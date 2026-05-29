import { getDriversForSelect } from "@/lib/actions/results.actions";
import { AchievementForm } from "@/components/admin/achievement-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    year?: string;
    category?: string;
  }>;
}

export default async function NewAchievementPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const year = parseInt(resolvedParams.year || "2026");
  const category = resolvedParams.category || "Formula 1";

  const drivers = await getDriversForSelect();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/admin/results?year=${year}&category=${encodeURIComponent(category)}`}>
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Results
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-extrabold">Add New Race Result</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Create an achievement record detailing an athlete's finish in a specific Grand Prix event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AchievementForm
            drivers={drivers}
            defaultYear={year}
            defaultCategory={category}
          />
        </CardContent>
      </Card>
    </div>
  );
}
