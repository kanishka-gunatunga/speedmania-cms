import { PolicyForm } from "@/components/policies/policy-form";
import { getPolicyById } from "@/lib/actions/policy.actions";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface EditPolicyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPolicyPage({ params }: EditPolicyPageProps) {
  const resolvedParams = await params;
  const policy = await getPolicyById(resolvedParams.id);

  if (!policy) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/policies">
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Policies
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-extrabold">Edit Policy: {policy.title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Update your website legal policy text and structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyForm initialData={policy} />
        </CardContent>
      </Card>
    </div>
  );
}
