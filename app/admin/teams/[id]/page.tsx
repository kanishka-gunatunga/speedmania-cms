import { getTeamById } from "@/lib/actions/team.actions";
import { getDrivers } from "@/lib/actions/driver.actions";
import { TeamForm } from "@/components/teams/team-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const team = await getTeamById(resolvedParams.id);
  const drivers = await getDrivers();

  if (!team) {
    notFound();
  }

  // Filter out drivers that are approved (or just allow linking any driver/rider)
  const approvedDrivers = drivers.filter(d => d.status === "approved" || !d.status);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/teams">
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Teams
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-extrabold">Edit Team: {team.name}</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Update team profile, biography, graphics and member rosters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamForm initialData={team} availableDrivers={approvedDrivers} />
        </CardContent>
      </Card>
    </div>
  );
}
