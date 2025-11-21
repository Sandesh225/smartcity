// app/(admin)/admin/staff/page.tsx
import { getStaffUsers, getWardsAndDepartments } from "@/lib/admin/staff";
import { StaffManagement } from "@/components/admin/StaffManagement";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [staffUsers, { wards, departments }] = await Promise.all([
    getStaffUsers(),
    getWardsAndDepartments(),
  ]);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title text-base">Staff & Assignments</h1>
          <p className="card-subtitle text-xs text-muted">
            Manage ward/department staff and their operational responsibilities.
          </p>
        </div>
      </div>

      <StaffManagement
        staffUsers={staffUsers}
        wards={wards}
        departments={departments}
      />
    </div>
  );
}
