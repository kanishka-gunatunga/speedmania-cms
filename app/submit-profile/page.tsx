import { DriverForm } from "@/components/drivers/driver-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitProfilePage() {
  return (
    <div className="container mx-auto p-8 max-w-5xl min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Driver Profile Submission</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Fill out the form below to submit your profile for the SpeedMania grid.
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl font-bold">Personal & Motorsport Details</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Please provide accurate and up-to-date information. Your profile will be reviewed by an administrator before appearing on the public grid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DriverForm isPublic={true} />
        </CardContent>
      </Card>
    </div>
  );
}
