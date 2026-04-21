import { CircuitForm } from "@/components/circuits/circuit-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCircuitPage() {
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
          <CardTitle className="text-3xl font-extrabold">Add New Circuit</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Fill in the technical details and storytelling for the track.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CircuitForm />
        </CardContent>
      </Card>
    </div>
  );
}
