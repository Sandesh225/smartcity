// app/(admin)/admin/payments/page.tsx
import { redirect } from "next/navigation";
import { requireSessionAndProfile } from "@/lib/auth/server-profile";
import type {
  AdminPaymentRow,
  PaymentsSummary,
} from "@/components/admin/payments/types";
import { AdminPaymentsClient } from "@/components/admin/payments/AdminPaymentsClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const { supabase, profile } = await requireSessionAndProfile(
    "/admin/payments"
  );

  if (!["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      id,
      reference_code,
      status,
      amount,
      currency,
      gateway,
      method,
      entity_type,
      entity_reference,
      created_at,
      paid_at,
      user:user_profiles(full_name),
      ward:wards(ward_number)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("AdminPaymentsPage error:", error);
  }

  const rows: AdminPaymentRow[] = (data || []).map((p: any) => ({
    id: p.id,
    reference_code: p.reference_code,
    status: p.status,
    amount: Number(p.amount ?? 0),
    currency: p.currency ?? "NPR",
    gateway: p.gateway,
    method: p.method,
    entity_type: p.entity_type,
    entity_reference: p.entity_reference,
    created_at: p.created_at,
    paid_at: p.paid_at,
    user_name: p.user?.full_name ?? null,
    ward_number: p.ward?.ward_number ?? null,
  }));

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const summary: PaymentsSummary = rows.reduce(
    (acc, row) => {
      acc.total_count += 1;
      acc.total_amount += row.amount;

      if (row.status === "success") acc.success_count += 1;
      if (row.status === "failed") acc.failed_count += 1;
      if (row.status === "pending") acc.pending_count += 1;
      if (row.status === "refunded") acc.refunded_count += 1;

      if (row.paid_at && row.paid_at.startsWith(todayStr)) {
        acc.today_amount += row.amount;
      }

      return acc;
    },
    {
      total_count: 0,
      total_amount: 0,
      success_count: 0,
      failed_count: 0,
      pending_count: 0,
      refunded_count: 0,
      today_amount: 0,
    } as PaymentsSummary
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments Monitoring</h1>
        <p className="text-sm text-slate-400">
          Monitor payment flows across property tax and services.
        </p>
      </div>

      <AdminPaymentsClient initialRows={rows} summary={summary} />
    </div>
  );
}
