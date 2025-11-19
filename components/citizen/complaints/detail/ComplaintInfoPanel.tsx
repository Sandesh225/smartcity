// FILE: components/citizen/complaints/detail/ComplaintInfoPanel.tsx
"use client";

import type { ComplaintSummaryViewModel } from "./types";
import { PriorityPill } from "./PriorityPill";
import { formatDateTime } from "./utils";

interface ComplaintInfoPanelProps {
  summary: ComplaintSummaryViewModel;
}

export function ComplaintInfoPanel({ summary }: ComplaintInfoPanelProps) {
  const { complaint, category, ward } = summary;

  return (
    <section className="rounded-2xl border border-glass-soft bg-surface-elevated/85 p-4 sm:p-5 shadow-glass-md backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Complaint information
        </h2>
      </div>

      <div className="grid gap-4 text-sm md:grid-cols-2">
        <InfoField label="Category">
          {category?.category_name ?? "Not specified"}
        </InfoField>

        <InfoField label="Ward">
          {ward
            ? `Ward ${ward.ward_number}${
                ward.ward_name ? ` · ${ward.ward_name}` : ""
              }`
            : "Not available"}
        </InfoField>

        <InfoField label="Priority">
          <PriorityPill priority={complaint.priority} />
        </InfoField>

        <InfoField label="Created at">
          {formatDateTime(complaint.created_at)}
        </InfoField>

        {complaint.sla_due_date && (
          <InfoField label="SLA due">
            {formatDateTime(complaint.sla_due_date)}
          </InfoField>
        )}

        {complaint.resolved_at && (
          <InfoField label="Resolved at">
            {formatDateTime(complaint.resolved_at)}
          </InfoField>
        )}
      </div>

      {(complaint.location_address || complaint.location_landmark) && (
        <div className="mt-4 space-y-2 text-sm">
          {complaint.location_address && (
            <InfoField label="Location">
              {complaint.location_address}
            </InfoField>
          )}
          {complaint.location_landmark && (
            <InfoField label="Landmark">
              {complaint.location_landmark}
            </InfoField>
          )}
        </div>
      )}
    </section>
  );
}

function InfoField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <div className="text-sm text-slate-100">{children}</div>
    </div>
  );
}
