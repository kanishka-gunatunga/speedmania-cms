import { DriverForm } from "@/components/drivers/driver-form";
import { getDriverById, approvePendingChanges, rejectPendingChanges } from "@/lib/actions/driver.actions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Check, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const driver = await getDriverById(resolvedParams.id);

  if (!driver) {
    notFound();
  }

  const pendingData = driver.pendingChanges ? JSON.parse(driver.pendingChanges) : null;
  const diffs: { label: string; current: string; pending: string }[] = [];

  if (pendingData) {
    const fieldsToCompare = [
      { key: "fullName", label: "Full Name" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "dob", label: "Date of Birth" },
      { key: "otherName", label: "Quote / Alias" },
      { key: "slug", label: "Slug" },
      { key: "racingCategory", label: "Racing Category" },
      { key: "yearsActive", label: "Years Active" },
      { key: "totalRaces", label: "Total Races" },
      { key: "totalWins", label: "Total Wins" },
      { key: "totalPodiums", label: "Total Podiums" },
      { key: "bestCareerFinish", label: "Best Career Finish" },
      { key: "championshipsWon", label: "Championships" },
      { key: "currentTeam", label: "Current Team" },
      { key: "previousTeams", label: "Previous Teams" },
      { key: "sponsorDetails", label: "Sponsor Details" },
      { key: "teamColor", label: "Team Hex Color" },
      { key: "accessibleColor", label: "Accessible Hex Color" },
      { key: "number", label: "Driver Number" },
      { key: "image", label: "Portrait URL" },
      { key: "numberImage", label: "Number Mask URL" },
      { key: "flagCode", label: "Country Flag Code" },
      { key: "country", label: "Country Name" },
      { key: "vehicleModel", label: "Vehicle Model" },
      { key: "engineCapacity", label: "Engine Capacity" },
      { key: "vehicleClass", label: "Vehicle Class" },
      { key: "chassisNumber", label: "Chassis Number" },
      { key: "liveryScheme", label: "Livery Scheme" },
      { key: "playerType", label: "Athlete Type" },
      { key: "careerPoints", label: "Career Points" },
      { key: "careerPoles", label: "Career Poles" },
      { key: "biography", label: "Biography" }
    ];

    fieldsToCompare.forEach(({ key, label }) => {
      const currentVal = (driver as any)[key];
      const pendingVal = pendingData[key];
      
      const normCurrent = String(currentVal || "").trim();
      const normPending = String(pendingVal || "").trim();

      if (normCurrent !== normPending) {
        diffs.push({
          label,
          current: normCurrent || "(empty)",
          pending: normPending || "(empty)"
        });
      }
    });

    // Compare Achievements
    const formatAchievements = (list: any[]) => {
      if (!list || list.length === 0) return "(none)";
      return list
        .map(a => {
          const parts = [];
          if (a.year) parts.push(`Year: ${a.year}`);
          if (a.raceName) parts.push(`Race: ${a.raceName}`);
          if (a.position) parts.push(`Pos: ${a.position}`);
          if (a.category) parts.push(`Cat: ${a.category}`);
          if (a.team) parts.push(`Team: ${a.team}`);
          if (a.date) parts.push(`Date: ${a.date}`);
          if (a.points) parts.push(`Pts: ${a.points}`);
          return parts.join(" | ");
        })
        .join("\n");
    };

    const currentAch = formatAchievements(driver.achievements);
    const pendingAch = formatAchievements(pendingData.achievements);

    if (currentAch !== pendingAch) {
      diffs.push({
        label: "Achievements",
        current: currentAch,
        pending: pendingAch
      });
    }

    // Compare Stats
    const formatStats = (list: any[]) => {
      if (!list || list.length === 0) return "(none)";
      return list
        .map(s => {
          const { id, driverId, ...rest } = s;
          const parts = [];
          if (rest.season) parts.push(`Season: ${rest.season}`);
          if (rest.category) parts.push(`Cat: ${rest.category}`);
          if (rest.bike) parts.push(`Veh: ${rest.bike}`);
          if (rest.starts) parts.push(`Starts: ${rest.starts}`);
          if (rest.poles) parts.push(`Poles: ${rest.poles}`);
          if (rest.firstPos) parts.push(`1st: ${rest.firstPos}`);
          if (rest.secondPos) parts.push(`2nd: ${rest.secondPos}`);
          if (rest.thirdPos) parts.push(`3rd: ${rest.thirdPos}`);
          if (rest.podiums) parts.push(`Podiums: ${rest.podiums}`);
          if (rest.points) parts.push(`Pts: ${rest.points}`);
          if (rest.position) parts.push(`Pos: ${rest.position}`);
          if (rest.fastestLaps) parts.push(`FL: ${rest.fastestLaps}`);
          if (rest.dnfs) parts.push(`DNF: ${rest.dnfs}`);
          if (rest.sprintRaces) parts.push(`Sprint: ${rest.sprintRaces}`);
          if (rest.sprintPoints) parts.push(`SPts: ${rest.sprintPoints}`);
          if (rest.sprintWins) parts.push(`SWins: ${rest.sprintWins}`);
          if (rest.sprintPodiums) parts.push(`SPod: ${rest.sprintPodiums}`);
          if (rest.sprintPoles) parts.push(`SPoles: ${rest.sprintPoles}`);
          return parts.join(" | ");
        })
        .join("\n");
    };

    const currentStats = formatStats(driver.riderStats);
    const pendingStats = formatStats(pendingData.riderStats);

    if (currentStats !== pendingStats) {
      diffs.push({
        label: "Rider/Driver Stats",
        current: currentStats,
        pending: pendingStats
      });
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-5xl">
       <div className="mb-6">
        <Link href="/admin/drivers">
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Drivers
          </Button>
        </Link>
      </div>

      {/* Comparison view for pending edits */}
      {pendingData && (
        <Card className="border-blue-500/30 bg-blue-500/5 mb-8 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <CardTitle className="text-xl font-bold uppercase tracking-wider">Proposed Edits Awaiting Review</CardTitle>
            </div>
            <CardDescription className="text-sm text-blue-600/80 dark:text-blue-400/80">
              This driver has submitted updates to their profile. Review the changes below before approving or rejecting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Diffs Table */}
            <div className="rounded-md border border-blue-500/20 bg-background/50 overflow-hidden">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-4 py-2 font-bold w-1/4">Field</th>
                    <th className="px-4 py-2 font-bold w-3/8 text-zinc-500">Current Value</th>
                    <th className="px-4 py-2 font-bold w-3/8 text-blue-600 dark:text-blue-400">Proposed Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {diffs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">
                        No field differences found (achievements or stats may have changed).
                      </td>
                    </tr>
                  ) : (
                    diffs.map((diff, index) => (
                      <tr key={index} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-semibold text-foreground">{diff.label}</td>
                        <td className="px-4 py-3 text-zinc-500 break-all whitespace-pre-line">{diff.current}</td>
                        <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-medium break-all whitespace-pre-line">{diff.pending}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Achievements & Stats Note */}
            <div className="text-xs text-muted-foreground italic">
              Note: Approving will also overwrite any achievements and rider stats with the values submitted in this draft.
            </div>

            {/* Actions Panel */}
            <div className="flex gap-4">
              <form action={async () => {
                "use server";
                await approvePendingChanges(driver.id);
              }}>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white gap-2 font-bold uppercase tracking-wider text-xs">
                  <Check className="w-4 h-4" />
                  Approve Changes
                </Button>
              </form>

              <form action={async () => {
                "use server";
                await rejectPendingChanges(driver.id);
              }}>
                <Button type="submit" variant="destructive" className="gap-2 font-bold uppercase tracking-wider text-xs">
                  <X className="w-4 h-4" />
                  Reject Changes
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Edit Form */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-extrabold">Edit Profile: {driver.fullName}</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Update motorsport credentials and statistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DriverForm initialData={driver} />
        </CardContent>
      </Card>
    </div>
  );
}
