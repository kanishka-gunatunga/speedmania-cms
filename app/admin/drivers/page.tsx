import { getDrivers, deleteDriver, approveDriver, rejectDriver } from "@/lib/actions/driver.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, User, Check, X } from "lucide-react";
import { SearchBar } from "@/components/admin/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function DriversPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const drivers = await getDrivers(q);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Driver & Rider Profiles</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage professional profiles for motorsport athletes.</p>
        </div>
        <Link href="/admin/drivers/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Profile
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Athletes</CardTitle>
          <CardDescription>
            You have {drivers.length} registered drivers and riders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar placeholder="Search athletes by name, team, category..." />
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No profiles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  drivers.map((driver) => (
                    <TableRow key={driver.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            {driver.fullName}
                            <div className="text-xs text-muted-foreground font-normal">{driver.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${driver.playerType === 'rider' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {driver.playerType || "driver"}
                        </span>
                      </TableCell>
                      <TableCell>{driver.racingCategory || "N/A"}</TableCell>
                      <TableCell>{driver.currentTeam || "Independent"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${driver.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : driver.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {driver.status || "pending"}
                          </span>
                          {driver.pendingChanges && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wider animate-pulse">
                              Pending Edits
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(driver.status === "pending" || !driver.status) && (
                            <>
                              <form action={async () => {
                                "use server";
                                await approveDriver(driver.id);
                              }}>
                                <Button type="submit" variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20" title="Approve">
                                  <Check className="h-4 w-4" />
                                </Button>
                              </form>
                              <form action={async () => {
                                "use server";
                                await rejectDriver(driver.id);
                              }}>
                                <Button type="submit" variant="outline" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20" title="Reject">
                                  <X className="h-4 w-4" />
                                </Button>
                              </form>
                            </>
                          )}
                          <Link href={`/admin/drivers/${driver.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <form action={async () => {
                            "use server";
                            await deleteDriver(driver.id);
                          }}>
                            <Button type="submit" variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
