import { getUsersList } from "@/lib/actions/auth.actions";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const limit = 10;
  const { users, total } = await getUsersList(page, limit);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage system users and view registered fans.
        </p>
      </div>

      <UsersTable 
        initialUsers={users} 
        page={page} 
        totalPages={Math.ceil(total / limit)} 
      />
    </div>
  );
}
