import { CircuitForm } from "@/components/circuits/circuit-form";
import { getCircuitById } from "@/lib/actions/circuit.actions";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditCircuitPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const circuit = await getCircuitById(resolvedParams.id);

  if (!circuit) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-5xl">
       <div className="mb-6">
        <Link href="/admin/circuits">
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Circuits
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-extrabold">Edit Circuit: {circuit.name}</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Update technical stats or add/remove FAQ entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CircuitForm initialData={circuit} />
        </CardContent>
      </Card>
    </div>
  );
}
