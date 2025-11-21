// components/admin/faqs/types.ts
export type FaqStatus = "draft" | "published" | "archived";

export interface FaqRow {
  id: string;
  question: string;
  question_nepali: string | null;
  answer: string;
  answer_nepali: string | null;
  category: string | null;
  tags: string[] | null;
  status: FaqStatus;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}
