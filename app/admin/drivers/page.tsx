import { getDrivers, deleteDriver } from "@/lib/actions/driver.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, User } from "lucide-react";
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

export default async function DriversPage() {
  const drivers = await getDrivers();

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
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Team</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
                      <TableCell>{driver.racingCategory || "N/A"}</TableCell>
                      <TableCell>{driver.currentTeam || "Independent"}</TableCell>
                      <TableCell>{driver.vehicleModel || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
