// app/(admin)/admin/cms/pages/new/page.tsx
import { redirect } from "next/navigation";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import { AdminPageForm } from "@/components/admin/pages/AdminPageForm";
import { createPageAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCreatePage() {
  const { profile } = await requireSessionAndProfile("/admin/cms/pages/new");

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Create Page</h1>
      <AdminPageForm mode="create" onSubmit={createPageAction} />
    </div>
  );
}
