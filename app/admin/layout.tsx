"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        {children}
      </main>
    </div>
  );
}
