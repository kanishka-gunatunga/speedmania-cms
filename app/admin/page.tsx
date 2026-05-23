import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, Eye, PenSquare, UserPlus, MapPin, Settings } from "lucide-react";
import { getBlogs } from "@/lib/actions/blog.actions";
import { getDrivers } from "@/lib/actions/driver.actions";
import Link from "next/link";

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

  const quickActions = [
    {
      title: "New Blog",
      description: "Write a new story or draft",
      href: "/admin/blogs/new",
      icon: PenSquare,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Add Athlete",
      description: "Register a driver or rider",
      href: "/admin/drivers/new",
      icon: UserPlus,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "New Circuit",
      description: "Add a race track profile",
      href: "/admin/circuits/new",
      icon: MapPin,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "System Settings",
      description: "View blogs and athletes",
      href: "/admin/blogs",
      icon: Settings,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
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
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="p-4 rounded-xl border border-border/60 flex items-start gap-4 hover:bg-muted/40 hover:border-primary/20 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className={cn("p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-110", action.bg)}>
                  <action.icon className={cn("w-5 h-5", action.color)} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold tracking-tight">{action.title}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{action.description}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
