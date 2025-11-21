// app/(admin)/admin/complaints/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import {
  AdminComplaintDetail,
  ComplaintAttachmentRow,
  ComplaintStatusHistoryRow,
} from "@/components/admin/complaints/types";
import { AdminComplaintStatusBadge } from "@/components/admin/complaints/AdminComplaintStatusBadge";
import {
  escalateComplaintAction,
  overrideComplaintStatusAction,
  updateComplaintStatusAction,
} from "../action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Clock,
  FileIcon,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default async function AdminComplaintDetailPage({ params }: PageParams) {
  const { id } = await params;
  const { supabase, profile } = await requireSessionAndProfile(
    `/admin/complaints/${id}`
  );

  if (!["admin", "super_admin", "staff", "officer"].includes(profile.role)) {
    redirect("/");
  }

  // Fetch complaint with joins
  const { data: complaintRaw, error: complaintError } = await supabase
    .from("complaints")
    .select(
      `
      id,
      reference_code,
      title,
      description,
      status,
      priority,
      created_at,
      updated_at,
      sla_due_at,
      address_text,
      ward:wards(ward_number, ward_name),
      department:departments(department_name),
      assignee:user_profiles!complaints_assigned_to_user_id_fkey(full_name),
      citizen:user_profiles!complaints_created_by_user_id_fkey(full_name, phone, email)
    `
    )
    .eq("id", id)
    .single();

  if (complaintError || !complaintRaw) {
    console.error("AdminComplaintDetail complaint error:", complaintError);
    notFound();
  }

  const complaint: AdminComplaintDetail = {
    id: complaintRaw.id,
    reference_code: complaintRaw.reference_code,
    title: complaintRaw.title,
    description: complaintRaw.description,
    status: complaintRaw.status,
    priority: complaintRaw.priority,
    ward_number: complaintRaw.ward?.ward_number ?? null,
    ward_name: complaintRaw.ward?.ward_name ?? null,
    department_name: complaintRaw.department?.department_name ?? null,
    assignee_name: complaintRaw.assignee?.full_name ?? null,
    created_at: complaintRaw.created_at,
    updated_at: complaintRaw.updated_at,
    sla_due_at: complaintRaw.sla_due_at,
    citizen_name: complaintRaw.citizen?.full_name ?? null,
    citizen_phone: complaintRaw.citizen?.phone ?? null,
    citizen_email: complaintRaw.citizen?.email ?? null,
    address_text: complaintRaw.address_text ?? null,
  };

  const [{ data: historyRows, error: historyError }, { data: attachments }] =
    await Promise.all([
      supabase
        .from("complaint_status_history_view")
        .select("*")
        .eq("complaint_id", id)
        .order("changed_at", { ascending: false }),
      supabase
        .from("complaint_attachments")
        .select("*")
        .eq("complaint_id", id)
        .order("uploaded_at", { ascending: true }),
    ]);

  if (historyError) {
    console.error("AdminComplaintDetail history error:", historyError);
  }

  const history = (historyRows || []) as ComplaintStatusHistoryRow[];
  const attachmentList = (attachments || []) as ComplaintAttachmentRow[];

  const isOverdue =
    complaint.sla_due_at &&
    !["resolved", "closed", "rejected"].includes(complaint.status) &&
    new Date(complaint.sla_due_at) < new Date();

  const canOverride = ["admin", "super_admin"].includes(profile.role);
  const canEscalate = ["admin", "super_admin", "officer"].includes(
    profile.role
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/admin/complaints"
            className="inline-flex items-center text-xs text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to list
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-100">
              {complaint.title}
            </h1>
            {complaint.reference_code && (
              <Badge
                variant="outline"
                className="border-slate-600 bg-slate-950/80 text-[11px] text-slate-200"
              >
                Ref: {complaint.reference_code}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>
              Created{" "}
              {new Date(complaint.created_at).toLocaleString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              Last update{" "}
              {new Date(complaint.updated_at).toLocaleString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <AdminComplaintStatusBadge status={complaint.status} />
          {complaint.sla_due_at && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px]",
                isOverdue
                  ? "bg-rose-950/70 text-rose-100"
                  : "bg-slate-900/80 text-slate-200"
              )}
            >
              <Clock className="h-3 w-3" />
              SLA:{" "}
              {new Date(complaint.sla_due_at).toLocaleString(undefined, {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {isOverdue && (
                <>
                  <AlertTriangle className="ml-1 h-3 w-3" />
                  Overdue
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1.4fr]">
        {/* Left column: description + history */}
        <div className="space-y-4">
          {/* Description card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm text-slate-200">
              {complaint.description}
            </p>
          </div>

          {/* Status history */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Status history
            </h2>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400">
                No status changes recorded yet.
              </p>
            ) : (
              <ul className="space-y-3 text-xs text-slate-200">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {h.old_status && (
                          <span className="rounded-full bg-slate-900/90 px-2 py-[1px] text-[10px] text-slate-300">
                            {h.old_status.replace("_", " ")} →
                          </span>
                        )}
                        <span className="rounded-full bg-emerald-900/40 px-2 py-[1px] text-[10px] text-emerald-200">
                          {h.new_status.replace("_", " ")}
                        </span>
                        {h.via_escalation && (
                          <Badge className="bg-amber-900/70 text-[10px] text-amber-100">
                            Escalation
                          </Badge>
                        )}
                        {h.via_override && (
                          <Badge className="bg-rose-900/70 text-[10px] text-rose-100">
                            Override
                          </Badge>
                        )}
                      </div>
                      {h.reason && (
                        <p className="text-[11px] text-slate-300">
                          Reason: {h.reason}
                        </p>
                      )}
                      {h.changed_by_name && (
                        <p className="text-[10px] text-slate-500">
                          By {h.changed_by_name}
                        </p>
                      )}
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-slate-400">
                      {new Date(h.changed_at).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column: meta + attachments + actions */}
        <div className="space-y-4">
          {/* Meta */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-100">
              Complaint details
            </h2>
            <dl className="space-y-2 text-xs text-slate-200">
              <RowItem label="Priority">
                <Badge
                  className={cn(
                    "border px-2 py-[2px] text-[10px]",
                    complaint.priority === "critical"
                      ? "border-rose-600/80 bg-rose-950/70 text-rose-100"
                      : complaint.priority === "high"
                      ? "border-amber-600/80 bg-amber-950/70 text-amber-100"
                      : complaint.priority === "medium"
                      ? "border-sky-600/70 bg-sky-950/70 text-sky-100"
                      : "border-slate-600/70 bg-slate-950/70 text-slate-100"
                  )}
                >
                  {complaint.priority.toUpperCase()}
                </Badge>
              </RowItem>

              {complaint.ward_number && (
                <RowItem label="Ward">
                  Ward {complaint.ward_number}
                  {complaint.ward_name ? ` — ${complaint.ward_name}` : ""}
                </RowItem>
              )}

              {complaint.department_name && (
                <RowItem label="Department">
                  {complaint.department_name}
                </RowItem>
              )}

              {complaint.address_text && (
                <RowItem label="Address">
                  <div className="flex items-start gap-1">
                    <MapPin className="mt-0.5 h-3 w-3 text-slate-500" />
                    <span>{complaint.address_text}</span>
                  </div>
                </RowItem>
              )}

              {complaint.citizen_name && (
                <RowItem label="Citizen">
                  <div className="space-y-0.5">
                    <p>{complaint.citizen_name}</p>
                    {complaint.citizen_phone && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Phone className="h-3 w-3" />
                        {complaint.citizen_phone}
                      </p>
                    )}
                    {complaint.citizen_email && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Mail className="h-3 w-3" />
                        {complaint.citizen_email}
                      </p>
                    )}
                  </div>
                </RowItem>
              )}

              {complaint.assignee_name && (
                <RowItem label="Assigned to">
                  {complaint.assignee_name}
                </RowItem>
              )}
            </dl>
          </div>

          {/* Attachments */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Attachments
            </h2>
            {attachmentList.length === 0 ? (
              <p className="text-xs text-slate-400">No attachments.</p>
            ) : (
              <ul className="space-y-1 text-xs text-slate-200">
                {attachmentList.map((a) => (
                  <li key={a.id}>
                    <a
                      href={a.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-900"
                    >
                      <FileIcon className="h-3 w-3 text-slate-500" />
                      <span>{a.file_name || "Attachment"}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions: escalate / override */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-100">
              Status & escalation
            </h2>

            {/* Quick transition (non-override) */}
            <form
              action={updateComplaintStatusAction}
              className="flex items-end gap-2"
            >
              <input type="hidden" name="complaint_id" value={complaint.id} />
              <div className="flex-1 space-y-1">
                <label className="text-xs text-slate-300">
                  Standard status change
                </label>
                <select
                  name="next_status"
                  defaultValue={complaint.status}
                  className="h-8 w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 text-xs text-slate-100"
                >
                  {["new", "in_progress", "resolved", "closed", "rejected"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    )
                  )}
                </select>
              </div>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="h-8 border-slate-700 bg-slate-900 text-xs"
              >
                Update
              </Button>
            </form>

            {canEscalate && (
              <form
                action={escalateComplaintAction}
                className="space-y-2 rounded-lg border border-amber-900/70 bg-amber-950/10 p-3"
              >
                <input
                  type="hidden"
                  name="complaint_id"
                  value={complaint.id}
                />
                <p className="flex items-center gap-2 text-xs font-medium text-amber-100">
                  <AlertTriangle className="h-3 w-3" />
                  Escalate complaint
                </p>
                <div className="grid gap-2 text-xs md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-amber-50">
                      Target priority
                    </label>
                    <select
                      name="target_priority"
                      defaultValue={complaint.priority}
                      className="h-8 w-full rounded-md border border-amber-800 bg-slate-950/80 px-2 text-[11px] text-slate-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-amber-50">
                      Target department (optional)
                    </label>
                    <input
                      name="target_department_id"
                      placeholder="Department ID"
                      className="h-8 w-full rounded-md border border-amber-800 bg-slate-950/80 px-2 text-[11px] text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-amber-50">
                    Escalation reason
                  </label>
                  <Textarea
                    name="reason"
                    required
                    className="min-h-[60px] resize-y border-amber-800 bg-slate-950/80 text-[11px] text-slate-100"
                    placeholder="Explain why this complaint is being escalated…"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 bg-amber-600 text-xs text-slate-950 hover:bg-amber-500"
                >
                  Escalate
                </Button>
              </form>
            )}

            {canOverride && (
              <form
                action={overrideComplaintStatusAction}
                className="space-y-2 rounded-lg border border-rose-900/70 bg-rose-950/10 p-3"
              >
                <input
                  type="hidden"
                  name="complaint_id"
                  value={complaint.id}
                />
                <p className="flex items-center gap-2 text-xs font-medium text-rose-100">
                  <AlertTriangle className="h-3 w-3" />
                  Override status (requires reason)
                </p>
                <div className="space-y-1">
                  <label className="text-[11px] text-rose-50">
                    Override to
                  </label>
                  <select
                    name="override_status"
                    defaultValue={complaint.status}
                    className="h-8 w-full rounded-md border border-rose-800 bg-slate-950/80 px-2 text-[11px] text-slate-100"
                  >
                    {["new", "in_progress", "resolved", "closed", "rejected"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-rose-50">
                    Override reason (required)
                  </label>
                  <Textarea
                    name="reason"
                    required
                    className="min-h-[60px] resize-y border-rose-800 bg-slate-950/80 text-[11px] text-slate-100"
                    placeholder="Document why the status is being force-changed…"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 bg-rose-600 text-xs text-slate-950 hover:bg-rose-500"
                >
                  Override status
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RowItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-[11px] font-medium text-slate-400">
        {label}
      </dt>
      <dd className="flex-1 text-xs text-slate-200">{children}</dd>
    </div>
  );
}
