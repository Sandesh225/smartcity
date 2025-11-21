// components/admin/payments/AdminPaymentsClient.tsx
"use client";

import { useMemo, useState } from "react";
import type {
  AdminPaymentRow,
  PaymentsSummary,
  PaymentStatus,
} from "./types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

type Props = {
  initialRows: AdminPaymentRow[];
  summary: PaymentsSummary;
};

const statusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  success: "Success",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export function AdminPaymentsClient({ initialRows, summary }: Props) {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all"
  );
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return initialRows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;

      return (
        row.reference_code.toLowerCase().includes(q) ||
        row.user_name?.toLowerCase().includes(q) ||
        row.entity_type?.toLowerCase().includes(q) ||
        row.entity_reference?.toLowerCase().includes(q)
      );
    });
  }, [initialRows, statusFilter, query]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total payments" value={summary.total_count} />
        <SummaryCard label="Total amount" value={summary.total_amount} money />
        <SummaryCard
          label="Successful"
          value={summary.success_count}
          tone="emerald"
        />
        <SummaryCard
          label="Pending"
          value={summary.pending_count}
          tone="amber"
        />
        <SummaryCard label="Failed" value={summary.failed_count} tone="red" />
        <SummaryCard
          label="Today (success)"
          value={summary.today_amount}
          money
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-slate-800 bg-slate-950 px-2">
          <Search className="h-4 w-4 text-slate-500" />
          <Input
            className="h-8 border-0 bg-transparent text-sm focus-visible:ring-0"
            placeholder="Search by reference, citizen, entity…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as PaymentStatus | "all")}
        >
          <SelectTrigger className="h-8 w-[150px] border-slate-800 bg-slate-950/80 text-xs text-slate-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-xs text-slate-100">
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(statusLabels) as PaymentStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
        <div className="grid grid-cols-[1.6fr,1fr,1fr,1fr,1fr] border-b border-slate-800 px-3 py-2 text-xs font-medium text-slate-400">
          <div>Payment</div>
          <div>Citizen / Ward</div>
          <div>Entity</div>
          <div>Status</div>
          <div>Amount</div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-400">
            No payments match your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1.6fr,1fr,1fr,1fr,1fr] items-center gap-2 px-3 py-3 text-xs text-slate-100"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{row.reference_code}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(row.created_at).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-slate-200">
                    {row.user_name || "Unknown citizen"}
                  </p>
                  {row.ward_number && (
                    <p className="text-[11px] text-slate-400">
                      Ward {row.ward_number}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-slate-200">
                    {row.entity_type || "N/A"}
                  </p>
                  {row.entity_reference && (
                    <p className="text-[11px] text-slate-400">
                      {row.entity_reference}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <StatusBadge status={row.status} />
                  <p className="text-[11px] text-slate-400">
                    {row.gateway || "Gateway"}{" "}
                    {row.method ? `· ${row.method}` : ""}
                  </p>
                </div>

                <div className="space-y-1 text-right">
                  <p className="text-sm font-semibold text-emerald-200">
                    {row.currency}{" "}
                    {row.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {row.paid_at && (
                    <p className="text-[11px] text-slate-400">
                      Paid{" "}
                      {new Date(row.paid_at).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
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
  money,
}: {
  label: string;
  value: number;
  tone?: "emerald" | "amber" | "red";
  money?: boolean;
}) {
  const toneMap = {
    emerald: {
      bg: "bg-emerald-950/50",
      border: "border-emerald-900/60",
      text: "text-emerald-100",
    },
    amber: {
      bg: "bg-amber-950/50",
      border: "border-amber-900/60",
      text: "text-amber-100",
    },
    red: {
      bg: "bg-rose-950/50",
      border: "border-rose-900/60",
      text: "text-rose-100",
    },
    default: {
      bg: "bg-slate-950/50",
      border: "border-slate-800",
      text: "text-slate-100",
    },
  } as const;

  const t = tone ? toneMap[tone] : toneMap.default;

  return (
    <div className={cn("rounded-xl border p-3 shadow-sm", t.bg, t.border)}>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={cn("mt-2 text-xl font-semibold", t.text)}>
        {money
          ? `NPR ${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-[1px] text-[10px]";

  if (status === "success") {
    return (
      <Badge
        className={cn(
          base,
          "border-emerald-700/70 bg-emerald-950/70 text-emerald-200"
        )}
      >
        Success
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge
        className={cn(
          base,
          "border-amber-700/70 bg-amber-950/70 text-amber-200"
        )}
      >
        Pending
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge
        className={cn(
          base,
          "border-rose-700/70 bg-rose-950/70 text-rose-200"
        )}
      >
        Failed
      </Badge>
    );
  }
  if (status === "refunded") {
    return (
      <Badge
        className={cn(
          base,
          "border-sky-700/70 bg-sky-950/70 text-sky-200"
        )}
      >
        Refunded
      </Badge>
    );
  }
  return (
    <Badge
      className={cn(
        base,
        "border-slate-700/70 bg-slate-950/70 text-slate-200"
      )}
    >
      Cancelled
    </Badge>
  );
}
