import { getCurrentUser, logoutUser } from "@/lib/actions/auth.actions";
import { redirect } from "next/navigation";
import { db, authorProfiles, blogs } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { AuthorForm } from "@/components/authors/author-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User, Plus, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AuthorDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "author") {
    redirect("/");
  }

  const profile = await db.query.authorProfiles.findFirst({
    where: eq(authorProfiles.userId, user.id),
  });

  let authorBlogs: any[] = [];
  if (profile) {
    authorBlogs = await db.query.blogs.findMany({
      where: eq(blogs.authorId, profile.id),
      orderBy: [desc(blogs.createdAt)],
    });
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground select-none">
      <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Author Portal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold uppercase tracking-widest text-foreground">
                Author Portal
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your public author profile details.</CardDescription>
              </CardHeader>
              <CardContent>
                <AuthorForm userId={user.id} initialData={profile} />
              </CardContent>
            </Card>
          </div>

          {/* Blogs Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Your Articles</CardTitle>
                  <CardDescription>Manage your blog posts here.</CardDescription>
                </div>
                {profile && (
                  <Link href="/author/dashboard/blogs/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" /> New Post
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {!profile ? (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    Please create your profile first before you can write articles.
                  </div>
                ) : authorBlogs.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-8 text-center bg-muted/20 border border-dashed rounded-lg">
                    You haven't written any articles yet.
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {authorBlogs.map(blog => (
                      <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/10 transition-colors">
                        <div>
                          <h3 className="font-semibold text-base">{blog.title}</h3>
                          <div className="flex gap-2 items-center mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {blog.published ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link href={`/author/dashboard/blogs/${blog.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </div>
  );
}
