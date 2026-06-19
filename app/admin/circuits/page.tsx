import { getCircuits, deleteCircuit } from "@/lib/actions/circuit.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MapPin, Globe } from "lucide-react";
import { SearchBar } from "@/components/admin/search-bar";
import { Pagination } from "@/components/admin/pagination";
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
    page?: string;
  }>;
}

export default async function CircuitsAdminPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const page = parseInt(resolvedParams.page || "1");
  const limit = 10;
  
  const { circuits, total } = await getCircuits(q, page, limit);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Race Circuits</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage motorsport tracks.</p>
        </div>
        <Link href="/admin/circuits/new">
          <Button size="lg" className="gap-2 font-bold shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" />
            New Circuit
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>All Circuits</CardTitle>
          <CardDescription>
            You have {total} racing circuits in your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar placeholder="Search circuits by name ..." />
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Circuit Name</TableHead>
                  <TableHead>Length</TableHead>
                  <TableHead>Laps</TableHead>
                  <TableHead>Top Record</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {circuits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                      No circuits found. Click "New Circuit" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  circuits.map((circuit) => (
                    <TableRow key={circuit.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            {circuit.name}
                            <div className="text-xs text-muted-foreground font-normal tracking-tight">{circuit.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">{circuit.circuitLength || "N/A"}</TableCell>
                      <TableCell>{circuit.numberOfLaps || "0"}</TableCell>
                      <TableCell className="text-xs">
                        {circuit.fastestLapTime ? (
                          <>
                            <div className="font-bold">{circuit.fastestLapTime}</div>
                            {circuit.fastestLapDriver && (
                              <div className="text-muted-foreground font-normal">
                                {circuit.fastestLapDriver} ({circuit.fastestLapYear || "-"})
                              </div>
                            )}
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/circuits/${circuit.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <form action={async () => {
                            "use server";
                            await deleteCircuit(circuit.id);
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
          <Pagination totalPages={Math.ceil(total / limit)} currentPage={page} />
        </CardContent>
      </Card>
    </div>
  );
}
