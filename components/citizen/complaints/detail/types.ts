// FILE: components/citizen/complaints/detail/types.ts

export type ComplaintStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected";

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export interface Complaint {
  id: string;
  title: string;
  tracking_id: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  description: string;
  resolution_notes?: string | null;
  created_at: string;
  sla_due_date?: string | null;
  resolved_at?: string | null;
  location_address?: string | null;
  location_landmark?: string | null;
  citizen_id: string;
  is_overdue?: boolean | null;
}

export interface Category {
  id: string;
  category_name: string;
}

export interface Ward {
  id: string;
  ward_number: number;
  ward_name: string;
}

export interface StatusHistoryEntry {
  id: string;
  to_status: ComplaintStatus | string;
  changed_at: string | null;
  notes?: string | null;
}

export interface WorkLogEntry {
  id: string;
  log_content: string;
  created_at: string | null;
  is_visible_to_citizen: boolean;
}

export interface ComplaintFeedback {
  id?: string;
  rating: number;
  feedback_comment?: string | null;
  created_at?: string | null;
}

export interface ComplaintSummaryViewModel {
  complaint: Complaint;
  category: Category | null;
  ward: Ward | null;
  status_history?: StatusHistoryEntry[] | null;
  work_logs?: WorkLogEntry[] | null;
  feedback?: ComplaintFeedback | null;
}
