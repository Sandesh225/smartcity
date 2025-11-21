// ============================================================================
// SECTION 1: Types Definition
// FILE: components/admin/notices/types.ts
// ============================================================================

export type NoticeStatus = "draft" | "published" | "archived";

export type NoticeType =
  | "general"
  | "tender"
  | "public_hearing"
  | "emergency"
  | "event";

export type WardOption = {
  id: string;
  ward_number: number;
  ward_name: string;
};

export type DepartmentOption = {
  id: string;
  department_name: string;
};

export type NoticeRow = {
  id: string;
  title: string;
  title_nepali: string | null;
  content: string;
  content_nepali: string | null;
  notice_type: NoticeType;
  status: NoticeStatus;
  published_date: string | null;
  expiry_date: string | null;
  is_featured: boolean;
  is_urgent: boolean;
  tags: string[] | null;
  related_ward_ids: string[] | null;
  related_department_id: string | null;
  slug: string;
  view_count: number;
  created_at: string;
  updated_at: string;
};

