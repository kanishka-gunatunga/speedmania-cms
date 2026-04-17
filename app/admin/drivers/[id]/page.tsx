import { DriverForm } from "@/components/drivers/driver-form";
import { getDriverById } from "@/lib/actions/driver.actions";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const driver = await getDriverById(resolvedParams.id);

  if (!driver) {
    notFound();
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
