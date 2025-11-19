// hooks/useComplaintCategories.ts
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';
import type { ComplaintCategory } from '@/stores/useCitizenComplaintWizard';

export function useComplaintCategories() {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabaseBrowser
        .from('complaint_categories')
        .select(
          'id, category_name, category_name_nepali, description, default_priority, sla_hours'
        )
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      setLoading(false);
      if (error || !data) {
        setErrorText('Unable to load complaint categories.');
        return;
      }
      setCategories(data as ComplaintCategory[]);
    })();
  }, []);

  return { categories, loading, errorText };
}
