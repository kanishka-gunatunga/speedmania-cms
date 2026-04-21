import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, Eye } from "lucide-react";
import { getBlogs } from "@/lib/actions/blog.actions";
import { getDrivers } from "@/lib/actions/driver.actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const blogs = await getBlogs();
  const drivers = await getDrivers();

  const stats = [
    {
      title: "Total Blogs",
      value: blogs.length,
      icon: FileText,
      description: "Published and drafts",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Active Drivers",
      value: drivers.length,
      icon: Users,
      description: "Registered athletes",
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Total Views",
      value: "1.2k",
      icon: Eye,
      description: "Across all content",
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Engagement",
      value: "+12%",
      icon: TrendingUp,
      description: "Since last month",
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back, Admin</h1>
        <p className="text-muted-foreground mt-2">Here's a quick overview of your Speedmania content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">{stat.title}</CardTitle>
              <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground italic">No recent activity logs available yet.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl border border-dashed flex flex-col items-center gap-2 hover:bg-muted/50 transition-colors">
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">New Blog</span>
            </button>
            <button className="p-4 rounded-xl border border-dashed flex flex-col items-center gap-2 hover:bg-muted/50 transition-colors">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Add Rider</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
