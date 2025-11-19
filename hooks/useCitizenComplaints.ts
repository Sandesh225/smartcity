// hooks/useCitizenComplaints.ts
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

export type ComplaintStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export type Complaint = {
  id: string;
  tracking_id: string;
  category_id: string;
  ward_id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  sla_due_date: string | null;
  is_overdue: boolean;
};

export function useCitizenComplaints(
  userId: string | null,
  pageSize: number,
  pageIndex: number
) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabaseBrowser
        .from('complaints')
        .select(
          'id, tracking_id, category_id, ward_id, title, description, status, priority, created_at, sla_due_date, is_overdue'
        )
        .eq('citizen_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      setLoading(false);

      if (error || !data) return;
      setComplaints(data as Complaint[]);
      setHasMore(data.length === pageSize);
    })();
  }, [userId, pageSize, pageIndex]);

  return { complaints, loading, hasMore };
}
