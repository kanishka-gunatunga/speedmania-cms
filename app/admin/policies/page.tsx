import { getPolicies } from "@/lib/actions/policy.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, FileText } from "lucide-react";
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

const POLICY_INFO: Record<string, { name: string; slug: string; desc: string }> = {
  "cookie-policy": {
    name: "Cookie Policy",
    slug: "cookie-policy",
    desc: "Explains cookie usage, tracking cookies, and how users can opt out."
  },
  "privacy-policy": {
    name: "Privacy Policy",
    slug: "privacy-policy",
    desc: "Governs privacy rights, personal data collection, and processing standards."
  },
  "legal-notice": {
    name: "Legal Notice",
    slug: "legal-notice",
    desc: "Contains ownership details, official operator status, and liability disclaimers."
  },
  "purchase-policy": {
    name: "Purchase Policy",
    slug: "purchase-policy",
    desc: "Handles terms of purchase, refunds, exchanges, and cancellations."
  },
  "terms-and-conditions": {
    name: "Terms and Conditions",
    slug: "terms-and-conditions",
    desc: "Core user agreement outlining rules for using the Speedmania platform."
  }
};

export default async function PoliciesPage() {
  const { policies = [] } = await getPolicies();

  // Map database policies with description meta
  const displayPolicies = Object.keys(POLICY_INFO).map(id => {
    const dbPolicy = policies.find(p => p.id === id);
    return {
      id,
      title: dbPolicy?.title || POLICY_INFO[id].name,
      description: POLICY_INFO[id].desc,
      slug: POLICY_INFO[id].slug,
      updatedAt: dbPolicy?.updatedAt ? new Date(dbPolicy.updatedAt).toLocaleString() : "Never",
    };
  });

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Policies Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage official policy documents and legal terms for Speedmania.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Official Legal Pages</CardTitle>
          <CardDescription>
            Configure legal agreements, policy updates, and rules of engagement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">Icon</TableHead>
                  <TableHead className="w-[300px]">Document Title</TableHead>
                  <TableHead className="w-[400px]">Description</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayPolicies.map((policy) => (
                  <TableRow key={policy.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {policy.title}
                      <div className="text-xs text-muted-foreground font-normal mt-1">/{policy.slug}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {policy.description}
                    </TableCell>
                    <TableCell className="text-sm">
                      {policy.updatedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/policies/${policy.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
