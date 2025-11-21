// app/(admin)/admin/complaints/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import type {
  AdminComplaintDetail,
  ComplaintStatusHistoryRow,
  ComplaintAttachmentRow,
} from "@/components/admin/complaints/types";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export default async function AdminComplaintDetailPage({ params }: PageProps) {
  const { supabase, profile } = await requireSessionAndProfile(
    `/admin/complaints/${params.id}`
  );

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/unauthorized");
  }

  const { data: complaint, error } = await supabase
    .from("complaints")
    .select(
      `
      complaint_id,
      tracking_id,
      title,
      description,
      status,
      priority_level,
      created_at,
      updated_at,
      sla_due_at,
      citizen_name,
      citizen_email,
      citizen_phone,
      address_text,
      wards(ward_number, ward_name),
      departments:departments!complaints_assigned_department_id_fkey(department_name),
      assignee:user_profiles!complaints_assigned_to_user_id_fkey(full_name)
    `
    )
    .eq("complaint_id", params.id)
    .single();

  if (error) {
    console.error("AdminComplaintDetail error", error);
    notFound();
  }

  const detail: AdminComplaintDetail = {
    id: complaint.complaint_id,
    reference_code: complaint.tracking_id,
    title: complaint.title,
    description: complaint.description,
    status: complaint.status,
    priority:
      complaint.priority_level === "urgent"
        ? "critical"
        : complaint.priority_level,
    ward_number: complaint.wards?.ward_number ?? null,
    ward_name: complaint.wards?.ward_name ?? null,
    department_name: complaint.departments?.department_name ?? null,
    assignee_name: complaint.assignee?.full_name ?? null,
    created_at: complaint.created_at,
    updated_at: complaint.updated_at,
    sla_due_at: complaint.sla_due_at,
    citizen_name: complaint.citizen_name,
    citizen_phone: complaint.citizen_phone,
    citizen_email: complaint.citizen_email,
    address_text: complaint.address_text,
  };

  const { data: history } = await supabase
    .from("complaint_status_history")
    .select(
      `
      id,
      complaint_id,
      old_status,
      new_status,
      changed_at,
      reason,
      via_escalation,
      via_override,
      changed_by:user_profiles(full_name)
    `
    )
    .eq("complaint_id", params.id)
    .order("changed_at", { ascending: false });

  const historyRows: ComplaintStatusHistoryRow[] = (history || []).map(
    (h: any) => ({
      id: h.id,
      complaint_id: h.complaint_id,
      old_status: h.old_status,
      new_status: h.new_status,
      changed_at: h.changed_at,
      changed_by_name: h.changed_by?.full_name ?? null,
      reason: h.reason,
      via_escalation: h.via_escalation,
      via_override: h.via_override,
    })
  );

  const { data: attachments } = await supabase
    .from("complaint_attachments")
    .select("*")
    .eq("complaint_id", params.id)
    .order("uploaded_at", { ascending: true });

  const attachmentRows: ComplaintAttachmentRow[] = (attachments || []).map(
    (a: any) => ({
      id: a.id,
      complaint_id: a.complaint_id,
      file_url: a.file_url,
      file_name: a.file_name,
      uploaded_at: a.uploaded_at,
    })
  );

  const overdue =
    detail.sla_due_at &&
    !["resolved", "closed", "rejected"].includes(detail.status) &&
    new Date(detail.sla_due_at) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">
            Tracking ID:{" "}
            <span className="font-mono text-slate-200">
              {detail.reference_code}
            </span>
          </p>
          <h1 className="text-xl font-semibold text-white">
            {detail.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Created{" "}
            {new Date(detail.created_at).toLocaleString(undefined, {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            {detail.ward_number && (
              <>
                · Ward {detail.ward_number}
                {detail.ward_name ? ` – ${detail.ward_name}` : ""}
              </>
            )}
          </p>
        </div>
        <Link href="/admin/complaints" className="chip text-xs">
          ← Back to complaints
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1.3fr]">
        {/* Left: description & history */}
        <div className="card space-y-4">
          <div>
            <h2 className="card-title text-sm mb-2">Description</h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">
              {detail.description || "No description provided."}
            </p>
          </div>

          <div>
            <h2 className="card-title text-sm mb-2">
              Status History
            </h2>
            {historyRows.length === 0 ? (
              <p className="text-xs text-muted">
                No status history recorded yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {historyRows.map((h) => (
                  <div
                    key={h.id}
                    className="rounded border border-border-subtle bg-bg-elevated p-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {h.old_status
                          ? `${h.old_status.replace("_", " ")} → ${h.new_status.replace(
                              "_",
                              " "
                            )}`
                          : `Created as ${h.new_status.replace("_", " ")}`}
                      </div>
                      <div className="text-[10px] text-muted">
                        {new Date(h.changed_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      By: {h.changed_by_name || "System"}
                    </div>
                    {h.reason && (
                      <div className="text-[11px] text-slate-400 mt-1">
                        Reason: {h.reason}
                      </div>
                    )}
                    {(h.via_escalation || h.via_override) && (
                      <div className="mt-1 text-[10px] text-amber-300">
                        {h.via_escalation && "Escalated "}
                        {h.via_override && "(Override applied)"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: meta, citizen info, attachments */}
        <div className="space-y-4">
          <div className="card space-y-2">
            <h2 className="card-title text-sm">Meta</h2>
            <div className="text-xs space-y-1 text-slate-300">
              <div>
                <span className="text-muted">Status:</span>{" "}
                <span className="font-medium">
                  {detail.status.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="text-muted">Priority:</span>{" "}
                <span className="font-medium">
                  {detail.priority.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-muted">Department:</span>{" "}
                <span className="font-medium">
                  {detail.department_name || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="text-muted">Assignee:</span>{" "}
                <span className="font-medium">
                  {detail.assignee_name || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="text-muted">SLA due:</span>{" "}
                {detail.sla_due_at ? (
                  <span
                    className={
                      overdue ? "text-rose-300 font-semibold" : ""
                    }
                  >
                    {new Date(detail.sla_due_at).toLocaleString()}
                    {overdue && " · Overdue"}
                  </span>
                ) : (
                  <span className="text-muted">Not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="card space-y-2">
            <h2 className="card-title text-sm">Citizen</h2>
            <div className="text-xs space-y-1 text-slate-300">
              <div>
                <span className="text-muted">Name:</span>{" "}
                <span className="font-medium">
                  {detail.citizen_name || "Unknown"}
                </span>
              </div>
              <div>
                <span className="text-muted">Phone:</span>{" "}
                {detail.citizen_phone || "—"}
              </div>
              <div>
                <span className="text-muted">Email:</span>{" "}
                {detail.citizen_email || "—"}
              </div>
              <div>
                <span className="text-muted">Address:</span>{" "}
                {detail.address_text || "—"}
              </div>
            </div>
          </div>

          <div className="card space-y-2">
            <h2 className="card-title text-sm">Attachments</h2>
            {attachmentRows.length === 0 ? (
              <p className="text-xs text-muted">No attachments.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {attachmentRows.map((a) => (
                  <li key={a.id}>
                    <a
                      href={a.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-300 hover:underline"
                    >
                      {a.file_name || "Attachment"}
                    </a>
                    <span className="text-muted text-[10px] ml-2">
                      {new Date(a.uploaded_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
