// components/admin/complaints/AdminComplaintsClient.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  UserCircle2,
} from "lucide-react";

import { AdminComplaintStatusBadge } from "./AdminComplaintStatusBadge";
import type {
  AdminComplaintRow,
  AdminComplaintSummary,
  StaffOption,
  ComplaintStatus,
} from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assignComplaintAction,
  updateComplaintStatusAction,
} from "@/app/(admin)/admin/complaints/action";
import { cn } from "@/lib/utils";

type Props = {
  initialRows: AdminComplaintRow[];
  summary: AdminComplaintSummary;
  staffOptions: StaffOption[];
};

const statusFilterOptions: { value: ComplaintStatus | "all"; label: string }[] =
  [
    { value: "all", label: "All statuses" },
    { value: "new", label: "New" },
    { value: "in_progress", label: "In progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
    { value: "rejected", label: "Rejected" },
  ];

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
} as const;

export function AdminComplaintsClient({
  initialRows,
  summary,
  staffOptions,
}: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusFilterOptions)[number]["value"]>("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const filteredRows = useMemo(() => {
    const now = new Date();
    return initialRows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }

      if (onlyOverdue) {
        if (
          !row.sla_due_at ||
          ["resolved", "closed", "rejected"].includes(row.status)
        ) {
          return false;
        }
        const due = new Date(row.sla_due_at);
        if (due > now) return false;
      }

      if (!query.trim()) return true;

      const q = query.toLowerCase();
      return (
        row.reference_code?.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.ward_name?.toLowerCase().includes(q) ||
        row.department_name?.toLowerCase().includes(q)
      );
    });
  }, [initialRows, query, statusFilter, onlyOverdue]);

  return (
    <div className="space-y-5">
      {/* KPI / Summary cards */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total" value={summary.total} />
        <SummaryCard label="New" value={summary.new_count} tone="sky" />
        <SummaryCard
          label="In progress"
          value={summary.in_progress_count}
          tone="amber"
        />
        <SummaryCard
          label="Resolved"
          value={summary.resolved_count}
          tone="emerald"
        />
        <SummaryCard
          label="Closed"
          value={summary.closed_count}
          tone="slate"
        />
        <SummaryCard
          label="Overdue"
          value={summary.overdue_count}
          tone="red"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-md border border-slate-800 bg-slate-950 px-2">
          <Search className="h-4 w-4 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, ref code, ward, department…"
            className="h-8 border-0 bg-transparent text-sm focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <Select
            value={statusFilter}
            onValueChange={(val) =>
              setStatusFilter(val as (typeof statusFilterOptions)[number]["value"])
            }
          >
            <SelectTrigger className="h-8 w-[160px] border-slate-800 bg-slate-950/80 text-xs text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-xs text-slate-100">
              {statusFilterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() => setOnlyOverdue((v) => !v)}
          className={cn(
            "flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
            onlyOverdue
              ? "border-red-600 bg-red-950/60 text-red-100"
              : "border-slate-700 bg-slate-950 text-slate-300"
          )}
        >
          <AlertTriangle className="h-3 w-3" />
          Overdue only
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
        <div className="grid grid-cols-[minmax(220px,2fr),minmax(120px,1fr),minmax(120px,1fr),minmax(150px,1.2fr),minmax(160px,1.5fr),minmax(190px,1.7fr)] border-b border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-medium text-slate-400">
          <div>Complaint</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Ward / Dept</div>
          <div>Assignee</div>
          <div>Actions</div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400">
            No complaints match your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredRows.map((row) => (
              <Row
                key={row.id}
                row={row}
                staffOptions={staffOptions}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone?: "sky" | "amber" | "emerald" | "slate" | "red";
  icon?: React.ReactNode;
}) {
  const toneMap: Record<
    NonNullable<typeof tone>,
    { bg: string; text: string; border: string }
  > = {
    sky: {
      bg: "bg-sky-950/50",
      text: "text-sky-100",
      border: "border-sky-900/60",
    },
    amber: {
      bg: "bg-amber-950/50",
      text: "text-amber-100",
      border: "border-amber-900/60",
    },
    emerald: {
      bg: "bg-emerald-950/50",
      text: "text-emerald-100",
      border: "border-emerald-900/60",
    },
    slate: {
      bg: "bg-slate-950/50",
      text: "text-slate-100",
      border: "border-slate-800",
    },
    red: {
      bg: "bg-rose-950/50",
      text: "text-rose-100",
      border: "border-rose-900/60",
    },
  };

  const toneStyles = tone ? toneMap[tone] : toneMap.slate;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 shadow-sm",
        toneStyles.bg,
        toneStyles.border
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        {icon && <span className={cn("text-xs", toneStyles.text)}>{icon}</span>}
      </div>
      <p
        className={cn(
          "mt-2 text-xl font-semibold leading-tight",
          toneStyles.text
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Row({
  row,
  staffOptions,
}: {
  row: AdminComplaintRow;
  staffOptions: StaffOption[];
}) {
  const overdue =
    row.sla_due_at &&
    !["resolved", "closed", "rejected"].includes(row.status) &&
    new Date(row.sla_due_at) < new Date();

  return (
    <div className="grid grid-cols-[minmax(220px,2fr),minmax(120px,1fr),minmax(120px,1fr),minmax(150px,1.2fr),minmax(160px,1.5fr),minmax(190px,1.7fr)] items-center gap-2 px-3 py-3 text-xs text-slate-100">
      {/* Complaint summary */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/complaints/${row.id}`}
            className="line-clamp-1 text-sm font-medium text-slate-100 hover:text-emerald-300"
          >
            {row.title}
          </Link>
          {row.reference_code && (
            <Badge
              variant="outline"
              className="border-slate-700 bg-slate-950/80 text-[10px] text-slate-300"
            >
              {row.reference_code}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span>
            Created{" "}
            {new Date(row.created_at).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
            })}
          </span>
          {row.sla_due_at && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-[2px]",
                overdue
                  ? "bg-rose-950/60 text-rose-200"
                  : "bg-slate-900/80 text-slate-300"
              )}
            >
              SLA{" "}
              {new Date(row.sla_due_at).toLocaleString(undefined, {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {overdue && <AlertTriangle className="h-3 w-3" />}
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <AdminComplaintStatusBadge status={row.status} />
      </div>

      {/* Priority */}
      <div>
        <Badge
          className={cn(
            "border px-2 py-[2px] text-[11px]",
            row.priority === "critical"
              ? "border-rose-600/80 bg-rose-950/70 text-rose-100"
              : row.priority === "high"
              ? "border-amber-600/80 bg-amber-950/70 text-amber-100"
              : row.priority === "medium"
              ? "border-sky-600/70 bg-sky-950/70 text-sky-100"
              : "border-slate-600/70 bg-slate-950/70 text-slate-100"
          )}
        >
          {priorityLabels[row.priority]}
        </Badge>
      </div>

      {/* Ward / Dept */}
      <div className="space-y-1">
        {row.ward_number && (
          <p className="text-xs text-slate-200">
            Ward {row.ward_number}
            {row.ward_name ? ` — ${row.ward_name}` : ""}
          </p>
        )}
        {row.department_name && (
          <p className="text-[11px] text-slate-400">{row.department_name}</p>
        )}
      </div>

      {/* Assignee */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[11px]">
          <UserCircle2 className="h-3 w-3 text-slate-500" />
          <span className="line-clamp-1 text-slate-200">
            {row.assignee_name || "Unassigned"}
          </span>
        </div>

        <form
          action={assignComplaintAction}
          className="flex items-center gap-1"
        >
          <input type="hidden" name="complaint_id" value={row.id} />
          <Select
            name="assignee_id"
            defaultValue=""
            onValueChange={() => {
              // auto-submit via form action + no JS needed
            }}
          >
            <SelectTrigger className="h-7 w-full border-slate-800 bg-slate-950/80 text-[11px] text-slate-100">
              <SelectValue placeholder="Assign / reassign" />
            </SelectTrigger>
            <SelectContent className="max-h-64 border-slate-800 bg-slate-900 text-[11px] text-slate-100">
              <SelectItem key="none" value="">
                Unassigned
              </SelectItem>
              {staffOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.full_name}
                  {s.email ? ` (${s.email})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <form
          action={updateComplaintStatusAction}
          className="flex items-center gap-1"
        >
          <input type="hidden" name="complaint_id" value={row.id} />
          <Select name="next_status" defaultValue="">
            <SelectTrigger className="h-7 w-[120px] border-slate-800 bg-slate-950/80 text-[11px] text-slate-100">
              <SelectValue placeholder="Change…" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-[11px] text-slate-100">
              {["new", "in_progress", "resolved", "closed", "rejected"].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            size="xs"
            variant="outline"
            className="h-7 border-slate-700 bg-slate-900 text-[11px]"
          >
            Update
          </Button>
        </form>

        <Link href={`/admin/complaints/${row.id}`}>
          <Button
            size="xs"
            variant="ghost"
            className="h-7 text-[11px] text-slate-300 hover:text-emerald-300"
          >
            Detail
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
