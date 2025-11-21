// app/(admin)/admin/users/page.tsx
import { getAllUsers } from "@/lib/admin/users";
import { UserList } from "@/components/admin/UserList";

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    status?: string;
    ward_id?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page || "1");
  const limit = Number(searchParams.limit || "50");

  const result = await getAllUsers({
    page,
    limit,
    search: searchParams.search,
    role: searchParams.role,
    status: searchParams.status,
    ward_id: searchParams.ward_id,
  });

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title text-base">Users</h1>
            <p className="card-subtitle text-xs text-muted">
              All registered citizens and staff with role & ward context.
            </p>
          </div>
        </div>
      </div>

      <UserList users={result.users} />
      {/* You can later add pagination controls here using result.total/page/limit */}
    </div>
  );
}
