import { DriverForm } from "@/components/drivers/driver-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, logoutUser } from "@/lib/actions/auth.actions";
import { db, drivers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, CheckCircle2, AlertTriangle, Clock, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubmitProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }
  if (user.role === "author") {
    redirect("/author/dashboard");
  }

  // Fetch driver profile for the logged in user
  const driver = await db.query.drivers.findFirst({
    where: eq(drivers.userId, user.id),
    with: {
      achievements: true,
      riderStats: true,
    },
  });

  let initialData = driver;
  let hasPendingEdits = false;

  if (driver && driver.pendingChanges) {
    try {
      const pending = JSON.parse(driver.pendingChanges);
      hasPendingEdits = true;
      // Merge pending changes into driver so the form displays the edit version
      initialData = {
        ...driver,
        ...pending,
      };
    } catch (e) {
      console.error("Error parsing pending changes:", e);
    }
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground select-none">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Driver Portal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold uppercase tracking-widest text-foreground">
                Driver Portal
              </h1>
            </div>
            <p className="text-base text-muted-foreground mt-1">
              Logged in as <span className="font-semibold text-foreground">{user.username}</span>
            </p>
          </div>
          
          <form action={logoutUser}>
            <Button 
              type="submit"
              variant="outline" 
              size="sm" 
              className="gap-2 border-zinc-300 text-zinc-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-600 transition-all duration-200 cursor-pointer text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
          </form>
        </div>

        {/* Profile Status Messages */}
        {driver ? (
          <div className="mb-8">
            {driver.status === "pending" && (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                <Clock className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-base uppercase tracking-wider">Profile Submission Pending</h4>
                  <p className="text-sm mt-1 text-yellow-600/80 dark:text-yellow-400/80">
                    Your profile has been submitted and is currently pending review by an administrator. You can still update your details below in the meantime.
                  </p>
                </div>
              </div>
            )}

            {driver.status === "rejected" && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-base uppercase tracking-wider">Profile Submission Rejected</h4>
                  <p className="text-sm mt-1 text-red-600/80 dark:text-red-400/80">
                    Your profile was rejected by an administrator. Please review, update the details below, and submit it again.
                  </p>
                </div>
              </div>
            )}

            {driver.status === "approved" && (
              <>
                {hasPendingEdits ? (
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Info className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-base uppercase tracking-wider">Pending Changes Under Review</h4>
                      <p className="text-sm mt-1 text-blue-600/80 dark:text-blue-400/80">
                        Your public profile is live on the grid, but your latest edits are pending administrator approval. Below you are editing your proposed changes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-base uppercase tracking-wider">Profile Active</h4>
                      <p className="text-sm mt-1 text-green-600/80 dark:text-green-400/80">
                        Your profile is approved and live on the SpeedMania grid. Any edits you make below will require admin approval before becoming public.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="mb-8 p-4 bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-700">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 text-blue-500 shrink-0" />
              <div>
                <h4 className="font-bold text-base uppercase tracking-wider text-zinc-900">Create Your Profile</h4>
                <p className="text-sm mt-1 text-zinc-600">
                  Welcome to SpeedMania! You don't have a driver profile yet. Complete the form below to register your professional profile on our grid.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container with forced medium font size for labels and inputs */}
        <Card className="border-border bg-white shadow-sm text-left [&_label]:text-base [&_input]:text-base [&_textarea]:text-base [&_select]:text-base [&_p]:text-sm">
          <CardHeader className="pb-8 border-b border-border">
            <CardTitle className="text-3xl font-black uppercase tracking-wider text-foreground">Personal & Motorsport Details</CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">
              Please provide accurate and up-to-date information. Your profile will be reviewed by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <DriverForm isPublic={true} initialData={initialData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
