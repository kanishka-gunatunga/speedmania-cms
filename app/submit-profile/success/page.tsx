import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SubmitSuccessPage() {
  return (
    <div className="container mx-auto p-8 max-w-3xl min-h-screen flex items-center justify-center">
      <Card className="border-border/50 shadow-sm text-center py-12">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-green-600 dark:text-green-500">
            Profile Submitted Successfully!
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-4">
            Thank you for applying. Your profile has been sent to our administration team for review. 
            Once approved, it will be published to the official SpeedMania grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
