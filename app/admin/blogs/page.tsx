import { getBlogs, deleteBlog } from "@/lib/actions/blog.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { SearchBar } from "@/components/admin/search-bar";
import { Pagination } from "@/components/admin/pagination";
import { DeleteBlogButton } from "@/components/admin/delete-blog-button";
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

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q;
  const page = parseInt(resolvedParams.page || "1");
  const limit = 10;
  
  const { blogs, total } = await getBlogs(q, page, limit);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage speedmania articles, news, and race reports.</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
            You have {total} published or draft blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar placeholder="Search posts by title, author..." />
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[400px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No blog posts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  blogs.map((blog) => (
                    <TableRow key={blog.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        {blog.title}
                        <div className="text-xs text-muted-foreground font-normal mt-1">{blog.slug}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${blog.published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell>{blog.author || "Speedmania Team"}</TableCell>
                      <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/blogs/${blog.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteBlogButton blogId={blog.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination totalPages={Math.ceil(total / limit)} currentPage={page} />
        </CardContent>
      </Card>
    </div>
  );
}
