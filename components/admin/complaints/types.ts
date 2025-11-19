// components/admin/complaints/types.ts

export type ComplaintStatus =
  | 'new'
  | 'in_review'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type AdminComplaintRow = {
  id: string;
  reference_code: string | null;
  title: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  ward_number: number | null;
  ward_name: string | null;
  department_name: string | null;
  assignee_name: string | null;
  created_at: string;
  sla_due_at: string | null;
};

export type AdminComplaintSummary = {
  total: number;
  new_count: number;
  in_review_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
  overdue_count: number;
};

export type StaffOption = {
  id: string;
  full_name: string;
  email: string;
};
