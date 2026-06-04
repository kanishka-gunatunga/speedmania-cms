import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SubmitSuccessPage() {
  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full border-zinc-900 bg-zinc-950/60 shadow-2xl text-center py-12 px-6">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-blue-500" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-white uppercase tracking-wider">
            Submitted!
          </CardTitle>
          <CardDescription className="text-sm text-zinc-400 mt-4 leading-relaxed">
            Thank you for applying. Your driver profile has been sent to our administration team for review. 
            Once approved, it will be published to the official SpeedMania grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-8">
          <Link href="/">
            <Button variant="outline" className="gap-2 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
