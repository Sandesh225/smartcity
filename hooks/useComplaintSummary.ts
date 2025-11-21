// hooks/useComplaintSummary.ts
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';
import type { Complaint } from './useCitizenComplaints';
import type { ComplaintCategory } from '@/stores/useCitizenComplaintWizard';
import type { Ward } from './useWards';

export type ComplaintSummary = {
  complaint: Complaint & { ward_id: string; category_id: string };
  category: ComplaintCategory;
  ward: Ward & { ward_name_nepali: string | null };
  citizen: {
    id: string;
    full_name: string;
    phone: string | null;
  };
  status_history: {
    id: string;
    from_status: Complaint['status'] | null;
    to_status: Complaint['status'];
    notes: string | null;
    changed_at: string;
  }[];
  work_logs: {
    id: string;
    log_content: string;
    is_visible_to_citizen: boolean;
    created_at: string;
  }[];
  feedback: {
    id: string;
    rating: number;
    feedback_comment: string | null;
    response_time_rating: number | null;
    quality_rating: number | null;
    staff_behavior_rating: number | null;
  } | null;
};

export function useComplaintSummary() {
  const [summary, setSummary] = useState<ComplaintSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = async (complaintId: string) => {
    setLoading(true);
    setErrorText(null);
    setSummary(null);

    // ✅ FIX: Use p_complaint_uuid param name
    const { data, error } = await supabaseBrowser.rpc("get_complaint_summary", {
      p_complaint_uuid: complaintId,
    });

    setLoading(false);

    if (error) {
      if ((error as any).code === "PGRST116") {
        setErrorText("You are not allowed to view this complaint.");
      } else {
        setErrorText("Unable to load complaint details.");
      }
      return;
    }

    if (!data) {
      setErrorText("Complaint not found or not accessible.");
      return;
    }

    setSummary(data as ComplaintSummary);
  };

  return { summary, loading, errorText, load };
}
