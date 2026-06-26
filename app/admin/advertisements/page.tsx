import { getAdvertisements } from "@/lib/actions/advertisement.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAdvertisementButton } from "@/components/admin/delete-advertisement-button";
import { ToggleAdvertisementStatus } from "@/components/admin/toggle-advertisement-status";

export const dynamic = 'force-dynamic';

export default async function AdvertisementsPage() {
  const result = await getAdvertisements();
  const ads = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
        <Link href="/admin/advertisements/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Advertisement
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Advertisements</CardTitle>
          <CardDescription>
            Manage the banner advertisements that appear on the frontend. Only one advertisement is active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Active Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No advertisements found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div className="w-[60px] h-[30px] bg-zinc-100 flex items-center justify-center overflow-hidden border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>
                        {ad.linkUrl ? (
                          <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                            Link
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ToggleAdvertisementStatus id={ad.id} isActive={ad.isActive} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/advertisements/${ad.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DeleteAdvertisementButton id={ad.id} />
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
