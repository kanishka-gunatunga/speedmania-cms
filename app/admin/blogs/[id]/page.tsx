import { BlogForm } from "@/components/blogs/blog-form";
import { getBlogById } from "@/lib/actions/blog.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const blog = await getBlogById(resolvedParams.id);
  const categoriesList = await getCategories();

  if (!blog) {
    notFound();
  }

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
          <CardTitle className="text-3xl font-extrabold">Edit Post: {blog.title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Update your article details and content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogForm initialData={blog} categories={categoriesList} />
        </CardContent>
      </Card>
    </div>
  );
}
