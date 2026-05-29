import { getDriversForSelect, getRiderStatById } from "@/lib/actions/results.actions";
import { RiderStatForm } from "@/components/admin/rider-stat-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Award } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRiderStatPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch standings details and approved drivers in parallel
  const [riderStat, drivers] = await Promise.all([
    getRiderStatById(id),
    getDriversForSelect(),
  ]);

  if (!riderStat) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/admin/results?year=${riderStat.season || 2026}&category=${encodeURIComponent(riderStat.category || "Formula 1")}`}>
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Results
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-extrabold flex items-center gap-2">
            {/*<Award className="w-8 h-8 text-yellow-500 shrink-0" />*/}
            Edit Driver Standings
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Modify the season-long standings and point stats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RiderStatForm
            drivers={drivers}
            initialData={riderStat}
          />
        </CardContent>
      </Card>
    </div>
  );
}
