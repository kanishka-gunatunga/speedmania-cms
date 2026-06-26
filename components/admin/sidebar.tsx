"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  LayoutDashboard,
  Settings,
  ChevronRight,
  LogOut,
  Globe,
  Tag,
  Trophy,
  User,
  Shield,
  Search,
  CalendarDays,
  MonitorPlay
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    label: "Blog Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    label: "Driver Categories",
    href: "/admin/driver-categories",
    icon: Tag,
  },
  {
    label: "Rider Categories",
    href: "/admin/rider-categories",
    icon: Tag,
  },
  {
    label: "Circuit Categories",
    href: "/admin/circuit-categories",
    icon: Tag,
  },
  {
    label: "Team Categories",
    href: "/admin/team-categories",
    icon: Tag,
  },
  {
    label: "Standing Categories",
    href: "/admin/standing-categories",
    icon: Trophy,
  },
  {
    label: "Teams",
    href: "/admin/teams",
    icon: Shield,
  },
  {
    label: "Drivers & Riders",
    href: "/admin/drivers",
    icon: Users,
  },
  {
    label: "Circuits",
    href: "/admin/circuits",
    icon: Globe,
  },
  {
    label: "Calendar",
    href: "/admin/calendar",
    icon: CalendarDays,
  },
  {
    label: "Advertisements",
    href: "/admin/advertisements",
    icon: MonitorPlay,
  },
  {
    label: "Results & Standings",
    href: "/admin/results",
    icon: Trophy,
  },
  {
    label: "Racing in Sri Lanka",
    href: "/admin/slada",
    icon: FileText,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: User,
  },
  {
    label: "SEO Settings",
    href: "/admin/seo",
    icon: Search,
  },
];

import { logoutAdmin } from "@/lib/actions/auth.actions";
import { startTransition } from "react";

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the CMS?")) {
      startTransition(async () => {
        await logoutAdmin();
      });
    }
  };

  return (
    <div className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Speedmania</h1>
            <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        {/* <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-medium">Settings</span>
        </Link> */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors group cursor-pointer"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
