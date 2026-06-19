"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Users, ShieldAlert } from "lucide-react";
import { Pagination } from "@/components/admin/pagination";

interface User {
  id: string;
  username: string;
  role: string | null;
  createdAt: Date;
}

interface UsersTableProps {
  initialUsers: User[];
  page: number;
  totalPages: number;
}

export function UsersTable({ initialUsers, page, totalPages }: UsersTableProps) {
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (userId: string, username: string) => {
    if (username === "admin") {
      alert("Cannot delete the main admin account!");
      return;
    }

    if (confirm(`Are you sure you want to delete user "${username}"? All their comments will remain in the database.`)) {
      startTransition(async () => {
        const res = await deleteUser(userId);
        if (res.success) {
          setUsersList((prev) => prev.filter((u) => u.id !== userId));
        } else {
          alert(res.error || "Failed to delete user");
        }
      });
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Registered Users</CardTitle>
        </div>
        <CardDescription>
          View and manage registered fan accounts and administrator details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {usersList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No registered users found.
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((user) => {
                  const formattedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isAdmin = user.role === "admin";

                  return (
                    <TableRow key={user.id} className="hover:bg-muted/10">
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isAdmin
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                        >
                          {isAdmin && <ShieldAlert className="w-3 h-3" />}
                          {user.role || "fan"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formattedDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 gap-1.5 hover:cursor-pointer"
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={isPending || user.username === "admin"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <Pagination totalPages={totalPages} currentPage={page} />
      </CardContent>
    </Card>
  );
}
