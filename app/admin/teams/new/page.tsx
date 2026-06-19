import { getDrivers } from "@/lib/actions/driver.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { TeamForm } from "@/components/teams/team-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  const { drivers } = await getDrivers(undefined, 1, 1000);
  const categories = await getCategories("team");

  // Filter out drivers that are approved (or just allow linking any driver/rider)
  const approvedDrivers = drivers.filter(d => d.status === "approved" || !d.status);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Create Team</h1>
        <p className="text-muted-foreground mt-2 text-lg">Add a new constructor team profile to the grid.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
          <CardDescription>
            Fill out the form below to create a new constructor team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamForm availableDrivers={approvedDrivers} availableCategories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
