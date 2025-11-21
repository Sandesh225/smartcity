// components/admin/payments/types.ts
export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "refunded"
  | "cancelled";

export interface AdminPaymentRow {
  id: string;
  reference_code: string;
  user_name: string | null;
  ward_number: number | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: string | null;
  method: string | null;
  entity_type: string | null;
  entity_reference: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface PaymentsSummary {
  total_count: number;
  total_amount: number;
  success_count: number;
  failed_count: number;
  pending_count: number;
  refunded_count: number;
  today_amount: number;
}
