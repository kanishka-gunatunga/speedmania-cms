import { BlogForm } from "@/components/blogs/blog-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/actions/category.actions";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  const categoriesList = await getCategories("blog");

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/blogs">
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
            Back to Blogs
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-extrabold">Create New Post</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Write a new article for Speedmania. Fill in the details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogForm categories={categoriesList} />
        </CardContent>
      </Card>
    </div>
  );
}
