import { BlogForm } from "@/components/blogs/blog-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/actions/category.actions";
import { getBlogById } from "@/lib/actions/blog.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { db, authorProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditAuthorBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "author") redirect("/");

  const profile = await db.query.authorProfiles.findFirst({
    where: eq(authorProfiles.userId, user.id),
  });

  if (!profile) redirect("/author/dashboard");

  const blog = await getBlogById(resolvedParams.id);
  if (!blog || blog.authorId !== profile.id) {
    redirect("/author/dashboard");
  }

  const categoriesList = await getCategories("blog");

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/author/dashboard">
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-extrabold">Edit Article</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Update your article details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogForm 
            categories={categoriesList} 
            initialData={blog} 
            returnUrl="/author/dashboard" 
            authorId={profile.id} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
