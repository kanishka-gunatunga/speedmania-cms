import { getTeams, deleteTeam } from "@/lib/actions/team.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
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

export default async function TeamsAdminPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const page = parseInt(resolvedParams.page || "1");
  const limit = 10;
  
  const { teams, total } = await getTeams(q, page, limit);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Team Profiles</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage racing constructor profiles, rosters and statistics.</p>
        </div>
        <Link href="/admin/teams/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Team
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teams</CardTitle>
          <CardDescription>
            You have {total} registered constructor teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar placeholder="Search teams by name, category..." />
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Team Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>2026 Position</TableHead>
                  <TableHead>2026 Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No teams found.
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            {team.name}
                            <div className="text-xs text-muted-foreground font-normal">{team.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {team.teamCategories && team.teamCategories.length > 0 ? (
                            team.teamCategories.map((tc: any, i: number) => (
                              <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wider">
                                {tc.category?.name}
                              </span>
                            ))
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 uppercase tracking-wider">
                              {team.category || "Uncategorized"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{team.seasonPosition || "N/A"}</TableCell>
                      <TableCell>{team.seasonPoints ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/teams/${team.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <form action={async () => {
                            "use server";
                            await deleteTeam(team.id);
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
