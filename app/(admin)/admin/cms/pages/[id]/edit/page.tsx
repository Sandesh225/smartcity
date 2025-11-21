// app/(admin)/admin/cms/pages/[id]/edit/page.tsx
import { redirect } from "next/navigation";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import { AdminPageForm } from "@/components/admin/pages/AdminPageForm";
import type { PageRow } from "@/components/admin/pages/types";
import { updatePageAction } from "../../actions";

export const dynamic = "force-dynamic";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditPage({ params }: PageParams) {
  const { id } = await params;
  const { supabase, profile } = await requireSessionAndProfile(
    `/admin/cms/pages/${id}/edit`
  );

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("AdminEditPage error:", error);
    redirect("/admin/cms/pages");
  }

  const row = data as PageRow;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit Page</h1>
      <AdminPageForm
        mode="edit"
        initialValues={row}
        onSubmit={updatePageAction}
      />
    </div>
  );
}
