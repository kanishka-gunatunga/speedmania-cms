import { getUsersList } from "@/lib/actions/auth.actions";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getUsersList();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage system users and view registered fans.
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}
